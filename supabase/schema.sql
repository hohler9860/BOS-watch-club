-- Run this in your Supabase SQL Editor to set up the database

-- ═══════════════════════════════════════════
-- PROFILES (auto-created on signup via trigger)
-- ═══════════════════════════════════════════
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  role text default 'free',
  tier text default 'ENTHUSIAST',
  avatar_url text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "Admins can update all profiles"
  on public.profiles for update
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- Auto-create profile on signup (defaults to role='free')
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role, tier, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    'free',
    'FREE',
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══════════════════════════════════════════
-- ACCESS CODES (single-use, tier-linked)
-- ═══════════════════════════════════════════
create table if not exists public.access_codes (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  tier text not null,
  created_at timestamptz default now(),
  expires_at timestamptz,
  redeemed_by uuid references auth.users on delete set null,
  redeemed_at timestamptz,
  is_active boolean default true
);

alter table public.access_codes enable row level security;

-- Authenticated users can check/redeem codes (read by code value)
create policy "Authenticated users can read access codes"
  on public.access_codes for select
  using (auth.role() = 'authenticated');

-- Users can update a code to mark it redeemed (only if not already redeemed)
create policy "Authenticated users can redeem access codes"
  on public.access_codes for update
  using (auth.role() = 'authenticated' and redeemed_by is null);

-- Service role (admin) can insert codes — anon/authenticated cannot
-- Admin operations use supabase service role or direct SQL

-- ═══════════════════════════════════════════
-- RSVPs
-- ═══════════════════════════════════════════
create table if not exists public.rsvps (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  event_id text not null,
  created_at timestamptz default now(),
  unique (user_id, event_id)
);

alter table public.rsvps enable row level security;

create policy "Users can read own RSVPs"
  on public.rsvps for select
  using (auth.uid() = user_id);

create policy "Users can insert own RSVPs"
  on public.rsvps for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own RSVPs"
  on public.rsvps for delete
  using (auth.uid() = user_id);

create policy "Admins can read all rsvps"
  on public.rsvps for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "Admins can delete rsvps"
  on public.rsvps for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- RSVP lookup with member details (used by admin dashboard)
create or replace function public.get_event_rsvps(p_event_id text)
returns table (rsvp_id uuid, user_id uuid, rsvp_date timestamptz, name text, email text, tier text, role text)
as $$
  select r.id, r.user_id, r.created_at, p.name, p.email, p.tier, p.role
  from public.rsvps r
  join public.profiles p on p.id = r.user_id
  where r.event_id = p_event_id
  order by r.created_at desc;
$$ language sql security definer;

-- ═══════════════════════════════════════════
-- SUBMISSIONS (application forms — open to anyone)
-- ═══════════════════════════════════════════
create table if not exists public.submissions (
  id uuid default gen_random_uuid() primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  instagram text,
  tier text,
  created_at timestamptz default now()
);

alter table public.submissions enable row level security;

create policy "Anyone can insert submissions"
  on public.submissions for insert
  with check (true);

-- ═══════════════════════════════════════════
-- PAYMENTS (recorded by Stripe webhook)
-- ═══════════════════════════════════════════
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  stripe_session_id text unique,
  stripe_payment_intent text,
  amount integer not null,
  currency text default 'usd',
  tier text,
  status text default 'completed',
  created_at timestamptz default now()
);

alter table public.payments enable row level security;

create policy "Admins can read all payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );
