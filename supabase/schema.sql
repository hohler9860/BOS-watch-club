-- Run this in your Supabase SQL Editor to set up the database

-- Profiles table (auto-created on signup via trigger)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  tier text default 'ENTHUSIAST',
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, tier, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'tier', 'ENTHUSIAST'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RSVPs table
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

-- Submissions table (application forms)
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

-- Anyone can submit an application (no auth required)
create policy "Anyone can insert submissions"
  on public.submissions for insert
  with check (true);
