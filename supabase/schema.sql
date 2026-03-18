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

-- ═══════════════════════════════════════════
-- MISSING COLUMNS ON PROFILES
-- Added: documents existing columns used by application
-- ═══════════════════════════════════════════
-- The profiles table above is missing several columns that the application uses.
-- These should be added to the profiles CREATE TABLE or via ALTER TABLE:
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists collects text;
alter table public.profiles add column if not exists favorite_watch text;
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists instagram text;
alter table public.profiles add column if not exists admin_notes text;
alter table public.profiles add column if not exists access_code text;
alter table public.profiles add column if not exists status text default 'active';
alter table public.profiles add column if not exists show_in_directory boolean default true;
alter table public.profiles add column if not exists onboarding_complete boolean default false;

-- ═══════════════════════════════════════════
-- EVENTS
-- Added: documents existing table used by application
-- NOTE: RLS policies need to be reviewed for this table
-- ═══════════════════════════════════════════
create table if not exists public.events (
  id text primary key,
  name text not null,
  tagline text,
  description text,
  long_description text,
  venue text,
  location text,
  date text,
  time text,
  datetime timestamptz,
  access text default 'All Members',
  capacity text default '30 guests',
  dress_code text default 'Smart Casual',
  image text,
  payment_type text default 'on_us',
  price numeric,
  tier_minimum text default 'enthusiast',
  cancellation_fee numeric,
  status text default 'published',
  month text,
  day text,
  sort_order integer default 0,
  invited_users jsonb,
  created_at timestamptz default now()
);

alter table public.events enable row level security;

-- ═══════════════════════════════════════════
-- BLOG POSTS
-- Added: documents existing table used by application
-- NOTE: RLS policies need to be reviewed for this table
-- ═══════════════════════════════════════════
create table if not exists public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text,
  status text default 'draft',
  date text,
  sort_date text,
  author text default 'Admin',
  image text,
  substack_url text,
  created_at timestamptz default now()
);

alter table public.blog_posts enable row level security;

-- ═══════════════════════════════════════════
-- CLUB NEWS
-- Added: documents existing table used by application
-- NOTE: RLS policies need to be reviewed for this table
-- ═══════════════════════════════════════════
create table if not exists public.club_news (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  preview text,
  body text,
  date text,
  sort_date text,
  status text default 'draft',
  created_at timestamptz default now()
);

alter table public.club_news enable row level security;

-- ═══════════════════════════════════════════
-- DISCUSSIONS
-- Added: documents existing table used by application
-- NOTE: RLS policies need to be reviewed for this table
-- ═══════════════════════════════════════════
create table if not exists public.discussions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text not null,
  author text,
  author_id uuid references auth.users on delete set null,
  tier text,
  date text,
  sort_date text,
  tags jsonb default '[]'::jsonb,
  status text default 'approved',
  created_at timestamptz default now()
);

alter table public.discussions enable row level security;

-- ═══════════════════════════════════════════
-- DISCUSSION REPLIES
-- Added: documents existing table used by application
-- NOTE: RLS policies need to be reviewed for this table
-- ═══════════════════════════════════════════
create table if not exists public.discussion_replies (
  id uuid default gen_random_uuid() primary key,
  discussion_id uuid references public.discussions on delete cascade not null,
  author text,
  author_id uuid references auth.users on delete set null,
  tier text,
  body text not null,
  date text,
  created_at timestamptz default now()
);

alter table public.discussion_replies enable row level security;

-- ═══════════════════════════════════════════
-- SITE CONTENT (key-value pairs for CMS text blocks)
-- Added: documents existing table used by application
-- NOTE: RLS policies need to be reviewed for this table
-- ═══════════════════════════════════════════
create table if not exists public.site_content (
  key text primary key,
  value text
);

alter table public.site_content enable row level security;

-- ═══════════════════════════════════════════
-- FAQ ITEMS
-- Added: documents existing table used by application
-- NOTE: RLS policies need to be reviewed for this table
-- ═══════════════════════════════════════════
create table if not exists public.faq_items (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  answer text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.faq_items enable row level security;

-- ═══════════════════════════════════════════
-- BENEFITS
-- Added: documents existing table used by application
-- NOTE: RLS policies need to be reviewed for this table
-- ═══════════════════════════════════════════
create table if not exists public.benefits (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  icon text default 'star',
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.benefits enable row level security;

-- ═══════════════════════════════════════════
-- TIERS (membership tier definitions)
-- Added: documents existing table used by application
-- NOTE: RLS policies need to be reviewed for this table
-- ═══════════════════════════════════════════
create table if not exists public.tiers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price numeric,
  price_display text,
  period text,
  tagline text,
  founding_text text,
  benefits jsonb default '[]'::jsonb,
  edu_discount numeric,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.tiers enable row level security;

-- ═══════════════════════════════════════════
-- APPROVED MEMBERS (legacy email approval list)
-- Added: documents existing table used by application
-- NOTE: RLS policies need to be reviewed for this table
-- ═══════════════════════════════════════════
create table if not exists public.approved_members (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  tier text default 'ENTHUSIAST',
  added_at timestamptz default now()
);

alter table public.approved_members enable row level security;

-- ═══════════════════════════════════════════
-- USER NOTIFICATIONS (admin-to-user moderation alerts)
-- Added: documents existing table used by application
-- NOTE: RLS policies need to be reviewed for this table
-- ═══════════════════════════════════════════
create table if not exists public.user_notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  body text,
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.user_notifications enable row level security;

-- ═══════════════════════════════════════════
-- INTEREST SIGNUPS (pre-launch email collection)
-- Added: documents existing table used by application
-- NOTE: RLS policies need to be reviewed for this table
-- ═══════════════════════════════════════════
create table if not exists public.interest_signups (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamptz default now()
);

alter table public.interest_signups enable row level security;

-- ═══════════════════════════════════════════
-- RPC: check_is_admin()
-- Added: documents existing function used by application
-- Returns true if the currently authenticated user has is_admin = true
-- Called by AdminAuth.jsx to verify admin access
-- ═══════════════════════════════════════════
create or replace function public.check_is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
end;
$$ language plpgsql security definer;
