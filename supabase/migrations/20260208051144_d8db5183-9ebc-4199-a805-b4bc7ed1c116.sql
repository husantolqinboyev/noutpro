
-- OTP codes table for Telegram auth
CREATE TABLE public.otp_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text NOT NULL,
  code text NOT NULL,
  telegram_chat_id bigint NOT NULL,
  telegram_user_id bigint,
  full_name text,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '5 minutes'),
  is_used boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS with no public policies (only service role can access)
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Index for fast lookup
CREATE INDEX idx_otp_codes_phone_code ON public.otp_codes (phone, code) WHERE is_used = false;

-- Auto-cleanup old OTP codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.otp_codes WHERE expires_at < now() OR is_used = true;
$$;
