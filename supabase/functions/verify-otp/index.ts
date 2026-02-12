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

    if (!phone || !code) {
      return new Response(
        JSON.stringify({ error: "Telefon raqam va kod majburiy" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Clean up expired OTPs
    await supabase.rpc("cleanup_expired_otps");

    const normalizedPhone = normalizePhone(phone);

    // Find valid OTP - try both with and without + prefix
    const phonesToTry = [normalizedPhone];
    if (normalizedPhone.startsWith("+")) {
      phonesToTry.push(normalizedPhone.substring(1));
    } else {
      phonesToTry.push("+" + normalizedPhone);
    }

    let otpData = null;
    for (const p of phonesToTry) {
      const { data, error } = await supabase
        .from("otp_codes")
        .select("*")
        .eq("phone", p)
        .eq("code", code)
        .eq("is_used", false)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .maybeSingle();
      if (data && !error) {
        otpData = data;
        break;
      }
    }

    if (!otpData) {
      return new Response(
        JSON.stringify({ error: "Noto'g'ri yoki muddati o'tgan kod" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark OTP as used
    await supabase.from("otp_codes").update({ is_used: true }).eq("id", otpData.id);

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
