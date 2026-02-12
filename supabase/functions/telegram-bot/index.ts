import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TELEGRAM_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: Record<string, unknown>) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      ...(replyMarkup && { reply_markup: replyMarkup }),
    }),
  });
  await res.text(); // consume body
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const message = body.message;

    if (!message) {
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    const chatId = message.chat.id;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Handle /start command
    if (message.text === "/start") {
      await sendTelegramMessage(
        chatId,
        "👋 <b>NOUTPRO</b> botiga xush kelibsiz!\n\nRo'yxatdan o'tish uchun telefon raqamingizni ulashing.",
        {
          keyboard: [
            [{ text: "📱 Telefon raqamni ulashish", request_contact: true }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        }
      );
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    // Handle contact sharing
    if (message.contact) {
      const phone = message.contact.phone_number;
      const firstName = message.contact.first_name || "";
      const lastName = message.contact.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim();
      const telegramUserId = message.contact.user_id;

      // Clean up old OTPs for this phone
      await supabase.from("otp_codes").delete().eq("phone", phone);

      // Generate and store OTP
      const code = generateOTP();
      const { error } = await supabase.from("otp_codes").insert({
        phone,
        code,
        telegram_chat_id: chatId,
        telegram_user_id: telegramUserId,
        full_name: fullName,
      });

      if (error) {
        console.error("OTP insert error:", error);
        await sendTelegramMessage(chatId, "❌ Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      await sendTelegramMessage(
        chatId,
        `✅ Telefon raqamingiz qabul qilindi!\n\n🔐 Tasdiqlash kodingiz: <b>${code}</b>\n\nUshbu kodni saytga kiring va kiriting.\nKod 5 daqiqa ichida amal qiladi.`,
        { remove_keyboard: true }
      );
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    // Default response
    await sendTelegramMessage(
      chatId,
      "Iltimos, /start buyrug'ini yuboring yoki telefon raqamingizni ulashing."
    );

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Telegram bot error:", error);
    return new Response("OK", { status: 200, headers: corsHeaders });
  }
});
