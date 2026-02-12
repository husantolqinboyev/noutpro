
-- Fix comments RLS: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Anyone can view moderated comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can view all comments" ON public.comments;
DROP POLICY IF EXISTS "Users can view own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can update comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can delete comments" ON public.comments;

CREATE POLICY "Anyone can view moderated comments" ON public.comments FOR SELECT TO public USING (is_moderated = true);
CREATE POLICY "Admins can view all comments" ON public.comments FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Users can view own comments" ON public.comments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can update comments" ON public.comments FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admins can delete comments" ON public.comments FOR DELETE TO authenticated USING (is_admin());

-- Enable realtime for orders so admin gets notified
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
