-- ═══════════════════════════════════════════
-- BWC_LEADS — email capture from website CTA
-- ═══════════════════════════════════════════
create table if not exists public.bwc_leads (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  captured_at timestamptz default now()
);

alter table public.bwc_leads enable row level security;

-- Only service role inserts leads (from edge function)
-- No public read/write access
create policy "Service role full access on bwc_leads"
  on public.bwc_leads
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Index for duplicate checks and lookups
create index if not exists idx_bwc_leads_email on public.bwc_leads (email);
