-- Migration for shop settings
CREATE TABLE IF NOT EXISTS public.shop_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL DEFAULT '+998 90 123 45 67',
  email TEXT NOT NULL DEFAULT 'info@noutpro.uz',
  address TEXT NOT NULL DEFAULT 'Toshkent shahri, Yunusobod tumani, Axmad Donish ko''chasi, 2-uy',
  latitude DECIMAL(10, 8) DEFAULT 41.311081,
  longitude DECIMAL(11, 8) DEFAULT 69.240562,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert initial row if it doesn't exist
-- Using a fixed ID for the single settings row
INSERT INTO public.shop_settings (id, phone, email, address, latitude, longitude)
VALUES ('00000000-0000-0000-0000-000000000000', '+998 90 123 45 67', 'info@noutpro.uz', 'Toshkent shahri, Yunusobod tumani, Axmad Donish ko''chasi, 2-uy', 41.311081, 69.240562)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view shop settings" ON public.shop_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can update shop settings" ON public.shop_settings
  FOR UPDATE TO authenticated USING (is_admin());
