-- Increase OTP expiration time to 15 minutes
ALTER TABLE public.otp_codes 
ALTER COLUMN expires_at SET DEFAULT (now() + interval '15 minutes');

-- Update the cleanup function to also use 15 minutes or just rely on expires_at
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.otp_codes WHERE expires_at < now() OR is_used = true;
$$;
