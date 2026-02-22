-- Migration to add telegram_bot_url to shop_settings
ALTER TABLE public.shop_settings 
ADD COLUMN IF NOT EXISTS telegram_bot_url TEXT NOT NULL DEFAULT 'https://t.me/Noutproo_bot';

-- Update the existing row with the new default or specific value
UPDATE public.shop_settings 
SET telegram_bot_url = 'https://t.me/Noutproo_bot'
WHERE id = '00000000-0000-0000-0000-000000000000';
