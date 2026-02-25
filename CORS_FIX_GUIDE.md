# Supabase CORS Sozlash Qo'llanmasi

## 🚨 Muammo:
`Failed to fetch` xatoligi odatda CORS yoki network muammolaridan kelib chiqadi.

## ✅ To'g'ri Yechim:

### 1. Supabase Dashboard → Settings → API
1. Supabase Dashboard ga kiring
2. O'zingizning projectni tanlang
3. `Settings` → `API` bo'limiga o'ting
4. `Additional CORS Origins` qismiga quyidagi URL larni qo'shing:
   - `https://www.noutpromalika.uz`
   - `https://noutpromalika.uz`
   - `http://localhost:8080` (development uchun)

### 2. Edge Functions CORS (agar ishlatilsa)
Agar Edge Functions ishlatayotgan bo'lsangiz, ular uchun alohida CORS sozlashingiz kerak:
1. `supabase/functions/_shared/cors.ts` faylini yarating
2. Quyidagi kodni qo'shing:

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

### 3. Environment Variables Tekshirish
`.env.production` faylida to'g'ri kalitlar borligiga ishonch hosil qiling:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

### 4. Network Connection Tekshirish
- Internet aloqasi stabilmi?
- Firewall yoki VPN Supabase API ni bloklamayaptimi?
- Domain DNS yozuvlari to'g'ri sozlanganmi?

### 5. Browser Console Tekshirish
Browser console da quyidagilarni tekshiring:
- Network tab → Failed requests
- Console qatoridagi xatoliklar
- CORS header lar to'g'ri yuborilayotganligi

## 🔍 Tezkor Diagnostika
```javascript
// Browser console da ishga tushiring
fetch('https://xbuyuflvmfauvdlpguem.supabase.co/rest/v1/', {
  headers: {
    'apikey': 'your-anon-key',
    'Authorization': 'Bearer your-anon-key'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```
