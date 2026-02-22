# AI Yordamchi Integratsiyasi - Sozlash Qo'llanmasi

## 1. Atrofiy Muhit O'zgaruvchilari

`.env` fayliga quyidagi kalitni qo'shing:

```bash
VITE_SUPABASE_SECRET_KEY="your-supabase-secret-key-here"
```

### Supabase Secret Key:
1. [Supabase Dashboard](https://supabase.com/dashboard) ga kiring
2. Loyihangizni tanlang
3. `Settings` → `API` bo'limiga o'ting
4. `service_role` (secret) keyni nusxalang

## 2. Groq API Kalitini Supabase Secrets ga Qo'shish

Groq API kalitini `.env` fayliga emas, Supabase secrets ga qo'shing:

### Groq API Key:
1. [Groq Console](https://console.groq.com/) ga kiring
2. Hisobingizga kiring yoki ro'yxatdan o'ting
3. `API Keys` bo'limiga o'ting
4. Yangi API kalit yarating va nusxalang

### Supabase Secrets ga Qo'shish:
1. Supabase Dashboard → `Settings` → `Edge Functions` ga o'ting
2. `Secrets` bo'limiga o'ting
3. Yangi secret qo'shing:
   - **Name**: `GROQ_API_KEY`
   - **Value**: Siz nusxalagan Groq API kaliti

## 3. Edge Function Deployment

Groq API chaqiruvlari uchun Supabase Edge Function ni joylashtiring:

```bash
supabase functions deploy groq-chat
```

Yoki Supabase Dashboard orqali:
1. `Edge Functions` bo'limiga o'ting
2. `supabase/functions/groq-chat/index.ts` faylini yuklang

## 4. Ma'lumotlar Bazasi Sozlamalari

Quyidagi SQL migration ni Supabase ma'lumotlar bazasida bajaring:

1. Supabase Dashboard → `SQL Editor` ga o'ting
2. `supabase/migrations/20240217_ai_features.sql` faylidagi kodni nusxalang
3. SQL kodini `SQL Editor` ga joylashtiring va `RUN` tugmasini bosing

## 5. Xususiyatlar

### AI Yordamchi:
- ✅ Kundalik 5 marta foydalanish limiti
- ✅ Foydalanuvchi kayfiyatini kuzatish
- ✅ Mahsulotlarni tavsiya qilish
- ✅ O'zbek tilida javob berish
- ✅ Do'stona interfeys

### Ijtimoiy Tarmoqlar:
- ✅ Admin panel orqali boshqarish
- ✅ Telegram, Instagram, YouTube
- ✅ Faol/nofaol holat
- ✅ Foydalanuvchilar uchun ko'rish

### Joylashuv:
- ✅ GPS orqali joylashuvni aniqlash
- ✅ Manzilni avtomatik olish
- ✅ Google Maps va Yandex Maps integratsiyasi
- ✅ Xaritada ko'rish imkoniyati

## 6. Foydalanish

### Admin Panel:
1. `/admin` sahifasiga kiring
2. "Ijtimoiy tarmoqlar" tabiga o'ting
3. Yangi manzillar qo'shing va boshqaring

### Foydalanuvchi Dashboard:
1. `/dashboard` sahifasiga kiring
2. "AI Yordamchi" tabiga o'ting
3. Kayfiyatingizni tanlang
4. AI bilan suhbat boshlang
5. "Joylashuv" tabida joylashuvingizni aniqlang

## 7. Xavfsizlik

- Groq API kaliti Supabase secrets da xavfsiz saqlanadi
- Barcha API chaqiruvlari Edge Function orqali amalga oshiriladi
- Row Level Security (RLS) yoqilgan
- Foydalanuvchilar faqat o'z ma'lumotlariga kirish imkoniga ega

## 8. Muammolar va Yechimlar

### AI ishlamayapti:
- Groq API kaliti Supabase secrets ga to'g'ri qo'yilganligini tekshiring
- Edge Function muvaffaqiyatli joylashtirilganligini tekshiring
- Supabase secret key to'g'ri ekanligini tekshiring

### Joylashuv aniqlanmayapti:
- Browser ruxsatlarini tekshiring
- HTTPS orqali kirganingizga ishonch hosil qiling

### Ijtimoiy tarmoqlar ko'rinmayapti:
- Admin panelda ularni faollashtirganingizga ishonch hosil qiling
- Ma'lumotlar bazasi migration muvaffaqiyatli bajarilganligini tekshiring

### TypeScript xatoliklari:
- `npm install` ni qayta bajaring
- `npm run dev` ni qayta ishga tushing
