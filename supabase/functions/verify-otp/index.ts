import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, code } = await req.json();
    console.log(`Verifying OTP for phone: ${phone}, code length: ${code?.length}`);

    if (!phone || !code) {
      return new Response(
        JSON.stringify({ error: "Telefon raqam va kod majburiy" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Clean up expired OTPs
    try {
      await supabase.rpc("cleanup_expired_otps");
    } catch (e) {
      console.error("Cleanup OTPs error (non-fatal):", e);
    }

    const normalizedPhone = normalizePhone(phone);
    console.log(`Normalized phone: ${normalizedPhone}`);

    // Find valid OTP - try both with and without + prefix
    const phonesToTry = [normalizedPhone];
    if (normalizedPhone.startsWith("+")) {
      phonesToTry.push(normalizedPhone.substring(1));
    } else {
      phonesToTry.push("+" + normalizedPhone);
    }

    // Also try removing 998 prefix if it exists to be very robust
    if (normalizedPhone.startsWith("998")) {
      phonesToTry.push(normalizedPhone.substring(3));
    } else if (normalizedPhone.startsWith("+998")) {
      phonesToTry.push(normalizedPhone.substring(4));
    }

    console.log(`Phones to try: ${JSON.stringify(phonesToTry)}`);

    let otpData = null;
    let foundButExpired = false;
    let foundButUsed = false;
    let bestMatch = null;

    for (const p of phonesToTry) {
      const { data, error } = await supabase
        .from("otp_codes")
        .select("*")
        .eq("phone", p)
        .eq("code", code)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(`DB error for phone ${p}:`, error);
        continue;
      }

      if (data && data.length > 0) {
        console.log(`Matching records found for phone ${p}: ${data.length}`);
        for (const row of data) {
          const isExpired = new Date(row.expires_at) < new Date();
          if (row.is_used) {
            foundButUsed = true;
            console.log(`OTP for ${p} found but already used.`);
          } else if (isExpired) {
            foundButExpired = true;
            console.log(`OTP for ${p} found but expired at ${row.expires_at}. Current time: ${new Date().toISOString()}`);
          } else {
            bestMatch = row;
            console.log(`Perfect OTP match found for ${p}!`);
            break;
          }
        }
        if (bestMatch) break;
      }
    }

    otpData = bestMatch;

    if (!otpData) {
      let errorReason = "Noto'g'ri kod";
      if (foundButUsed) errorReason = "Ushbu kod allaqachon ishlatilgan";
      else if (foundButExpired) errorReason = "Kodni amal qilish muddati tugagan (5-15 daqiqa)";

      console.log(`OTP verification failed. Reason: ${errorReason}`);
      return new Response(
        JSON.stringify({
          error: errorReason,
          details: `Phone(s) tried: ${phonesToTry.join(', ')}. FoundUsed: ${foundButUsed}, FoundExpired: ${foundButExpired}.`
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark OTP as used
    const { error: updateError } = await supabase.from("otp_codes").update({ is_used: true }).eq("id", otpData.id);
    if (updateError) {
      console.error("Error marking OTP as used:", updateError);
      return new Response(
        JSON.stringify({ error: "Kodni ishlatilgan deb belgilashda xatolik", details: updateError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Derive email from phone
    const cleanPhone = normalizedPhone.replace(/[^0-9]/g, "");
    const email = `${cleanPhone}@noutpro.app`;
    const password = `noutpro_${cleanPhone}_secret`;

    // Check if user exists
    const { data: userList } = await supabase.auth.admin.listUsers();
    const existingUser = userList?.users?.find((u: any) => u.email === email);

    let userId: string;

    if (!existingUser) {
      // Create new user with email/password
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: otpData.full_name || "",
          phone: normalizedPhone,
        },
      });
      if (createError || !newUser?.user) {
        console.error("Create user error:", createError);
        return new Response(
          JSON.stringify({ error: "Foydalanuvchi yaratishda xatolik" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      userId = newUser.user.id;

      // Update profile with telegram info
      await supabase.from("profiles").update({
        telegram_id: otpData.telegram_user_id?.toString() || null,
        phone: normalizedPhone,
        full_name: otpData.full_name || "",
      }).eq("user_id", userId);
    } else {
      userId = existingUser.id;
      // Update password in case it changed
      await supabase.auth.admin.updateUserById(userId, { password });

      // Update profile with telegram info
      await supabase.from("profiles").update({
        telegram_id: otpData.telegram_user_id?.toString() || null,
      }).eq("user_id", userId);
    }

    // Return email and password for client-side signIn
    return new Response(
      JSON.stringify({
        email,
        password,
        user_id: userId,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Xatolik yuz berdi";
    console.error("Verify OTP error:", error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
