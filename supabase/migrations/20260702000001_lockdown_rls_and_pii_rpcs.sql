-- ============================================================
-- Security lockdown (2026-07-02)
--
-- Findings from the Supabase security advisors + manual audit:
--   * Content tables carried "Allow all <table>" FOR ALL USING(true)
--     policies: anyone holding the public anon key could INSERT /
--     UPDATE / DELETE events, blog posts, site content, FAQs, tiers.
--   * get_event_rsvps / get_event_guests are SECURITY DEFINER and
--     were executable by anon: they return member names + emails and
--     guest names + emails + dates of birth.
--   * Any signed-in member could read all applications (submissions),
--     the email/interest signup lists, and the approved_members list.
--
-- What this migration does:
--   1. Content tables: drop the permissive FOR ALL policies (public
--      reads stay via the existing "Public read *" SELECT policies);
--      writes become admin-only.
--   2. Discussions/replies: members write their own, admins moderate.
--   3. user_notifications: only admins may insert.
--   4. profiles: INSERT only for your own row (the signup trigger is
--      SECURITY DEFINER and unaffected).
--   5. submissions: members can no longer read applications (PII);
--      admin read stays, public insert (application form) stays.
--   6. email/interest signups: reads restricted to admins.
--   7. approved_members: public read removed. The login/signup email
--      gate now goes through the rate-limited /api/membership
--      { action: "check-approved" } endpoint instead.
--   8. get_event_rsvps / get_event_guests: admin-gated internally,
--      EXECUTE revoked from anon.
--   9. handle_new_user: not callable via the REST RPC surface.
-- ============================================================

-- ── 1. Admin-only writes on content tables ─────────────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['benefits','blog_posts','club_news','events','faq_items','site_content','tiers']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Allow all ' || t, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (check_is_admin())', 'Admins insert ' || t, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (check_is_admin()) WITH CHECK (check_is_admin())', 'Admins update ' || t, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (check_is_admin())', 'Admins delete ' || t, t);
  END LOOP;
END $$;

-- ── 2. Discussions: members own their content ──────────────
DROP POLICY IF EXISTS "Allow all discussions" ON public.discussions;
CREATE POLICY "Members insert own discussions" ON public.discussions
  FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "Authors or admins delete discussions" ON public.discussions
  FOR DELETE TO authenticated USING (author_id = auth.uid() OR check_is_admin());
CREATE POLICY "Admins update discussions" ON public.discussions
  FOR UPDATE TO authenticated USING (check_is_admin()) WITH CHECK (check_is_admin());

DROP POLICY IF EXISTS "Allow all discussion_replies" ON public.discussion_replies;
CREATE POLICY "Members insert own replies" ON public.discussion_replies
  FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "Authors or admins delete replies" ON public.discussion_replies
  FOR DELETE TO authenticated USING (author_id = auth.uid() OR check_is_admin());
CREATE POLICY "Admins update replies" ON public.discussion_replies
  FOR UPDATE TO authenticated USING (check_is_admin()) WITH CHECK (check_is_admin());

-- ── 3. Notifications: only admins create them ──────────────
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.user_notifications;
CREATE POLICY "Admins insert notifications" ON public.user_notifications
  FOR INSERT TO authenticated WITH CHECK (check_is_admin());

-- ── 4. Profiles: create only your own row ───────────────────
DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles;
CREATE POLICY "Users create own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ── 5. Submissions: applications are admin-eyes-only ───────
DROP POLICY IF EXISTS "Authenticated users can read submissions" ON public.submissions;

-- ── 6. Signup lists: admin reads only ──────────────────────
DROP POLICY IF EXISTS "Allow admin reads" ON public.email_signups;
CREATE POLICY "Admins read email_signups" ON public.email_signups
  FOR SELECT TO authenticated USING (check_is_admin());
DROP POLICY IF EXISTS "Allow admin reads" ON public.interest_signups;
CREATE POLICY "Admins read interest_signups" ON public.interest_signups
  FOR SELECT TO authenticated USING (check_is_admin());

-- ── 7. approved_members: no more public dump ───────────────
DROP POLICY IF EXISTS "Allow read access for auth check" ON public.approved_members;
CREATE POLICY "Admins read approved_members" ON public.approved_members
  FOR SELECT TO authenticated USING (check_is_admin());

-- ── 8. PII RPCs: admin-gated + not callable anonymously ────
CREATE OR REPLACE FUNCTION public.get_event_rsvps(p_event_id text)
 RETURNS TABLE(rsvp_id uuid, user_id uuid, rsvp_date timestamp with time zone, name text, email text, tier text, role text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    r.id          AS rsvp_id,
    r.user_id,
    r.created_at  AS rsvp_date,
    COALESCE(p.name, u.raw_user_meta_data->>'full_name', u.email) AS name,
    u.email,
    COALESCE(p.tier, 'ENTHUSIAST') AS tier,
    COALESCE(p.role, 'free')       AS role
  FROM rsvps r
  JOIN auth.users u ON u.id = r.user_id
  LEFT JOIN profiles p ON p.id = r.user_id
  WHERE r.event_id = p_event_id
    AND public.check_is_admin()
  ORDER BY r.created_at ASC;
$function$;

CREATE OR REPLACE FUNCTION public.get_event_guests(p_event_id text)
 RETURNS TABLE(guest_id uuid, rsvp_id uuid, invited_by uuid, inviter_name text, name text, email text, date_of_birth date, created_at timestamp with time zone, status text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT g.id, g.rsvp_id, g.invited_by, p.name AS inviter_name, g.name, g.email, g.date_of_birth, g.created_at, g.status
  FROM public.event_guests g
  JOIN public.profiles p ON p.id = g.invited_by
  WHERE g.event_id = p_event_id
    AND public.check_is_admin()
  ORDER BY g.created_at DESC;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_event_rsvps(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_event_guests(text) FROM anon, public;

-- ── 9. Trigger function is not an API ───────────────────────
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
