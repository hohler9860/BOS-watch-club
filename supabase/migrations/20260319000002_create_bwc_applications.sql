-- ═══════════════════════════════════════════
-- BWC_APPLICATIONS — Typeform submissions for membership
-- ═══════════════════════════════════════════
create table if not exists public.bwc_applications (
  id uuid default gen_random_uuid() primary key,
  submitted_at timestamptz default now(),
  full_name text,
  email text not null,
  instagram_handle text,
  membership_tier text,          -- Founder, Enthusiast, Collector, Patron
  referral_source text,
  status text default 'pending', -- pending / approved / rejected
  notes text,
  reviewed_at timestamptz
);

alter table public.bwc_applications enable row level security;

-- Only service role manages applications (from edge functions)
create policy "Service role full access on bwc_applications"
  on public.bwc_applications
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Admins can read all applications
create policy "Admins can read bwc_applications"
  on public.bwc_applications
  for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

-- Indexes for common queries
create index if not exists idx_bwc_applications_email on public.bwc_applications (email);
create index if not exists idx_bwc_applications_status on public.bwc_applications (status);
