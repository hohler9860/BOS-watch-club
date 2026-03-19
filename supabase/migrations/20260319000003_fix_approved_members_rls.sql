-- Fix check_is_admin() to bypass profiles RLS with SECURITY DEFINER + search_path
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate approved_members policies using check_is_admin()
DROP POLICY IF EXISTS "Admin can insert approved_members" ON public.approved_members;
CREATE POLICY "Admin can insert approved_members"
  ON public.approved_members
  FOR INSERT
  WITH CHECK (check_is_admin());

DROP POLICY IF EXISTS "Admin can delete approved_members" ON public.approved_members;
CREATE POLICY "Admin can delete approved_members"
  ON public.approved_members
  FOR DELETE
  USING (check_is_admin());

DROP POLICY IF EXISTS "Admin can update approved_members" ON public.approved_members;
CREATE POLICY "Admin can update approved_members"
  ON public.approved_members
  FOR UPDATE
  USING (check_is_admin())
  WITH CHECK (check_is_admin());
