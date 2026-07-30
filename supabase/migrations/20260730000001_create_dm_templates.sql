-- ============================================================
-- DM Templates (2026-07-30)
--
-- Admin-panel feature: cold-outreach DM templates managed by
-- admins (Henry / Stelios). No public/anon access at all —
-- every operation is gated by the existing check_is_admin()
-- helper (SECURITY DEFINER, checks public.profiles.is_admin),
-- same pattern as the 2026-07-02 RLS lockdown migration.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.dm_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  category text,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dm_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins select dm_templates" ON public.dm_templates
  FOR SELECT TO authenticated USING (check_is_admin());

CREATE POLICY "Admins insert dm_templates" ON public.dm_templates
  FOR INSERT TO authenticated WITH CHECK (check_is_admin());

CREATE POLICY "Admins update dm_templates" ON public.dm_templates
  FOR UPDATE TO authenticated USING (check_is_admin()) WITH CHECK (check_is_admin());

CREATE POLICY "Admins delete dm_templates" ON public.dm_templates
  FOR DELETE TO authenticated USING (check_is_admin());
