-- Add guest_policy column to events table
alter table public.events add column if not exists guest_policy text not null default 'members_only';

-- ═══════════════════════════════════════════
-- EVENT GUESTS
-- Stores +1 guest info for events that allow members_plus_one policy
-- One guest per RSVP (unique on rsvp_id)
-- ═══════════════════════════════════════════
create table if not exists public.event_guests (
  id uuid default gen_random_uuid() primary key,
  rsvp_id uuid references public.rsvps(id) on delete cascade not null,
  event_id text not null,
  invited_by uuid references auth.users on delete cascade not null,
  name text not null,
  email text not null,
  date_of_birth date not null,
  created_at timestamptz default now(),
  unique (rsvp_id)
);

alter table public.event_guests enable row level security;

create policy "Users can read own guests"
  on public.event_guests for select
  using (auth.uid() = invited_by);

create policy "Users can insert own guests"
  on public.event_guests for insert
  with check (auth.uid() = invited_by);

create policy "Users can delete own guests"
  on public.event_guests for delete
  using (auth.uid() = invited_by);

create policy "Admins can read all guests"
  on public.event_guests for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "Admins can delete guests"
  on public.event_guests for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- ═══════════════════════════════════════════
-- RPC: get_event_guests(p_event_id)
-- Returns guest list with inviter name for admin dashboard
-- ═══════════════════════════════════════════
create or replace function public.get_event_guests(p_event_id text)
returns table (guest_id uuid, rsvp_id uuid, invited_by uuid, inviter_name text, name text, email text, date_of_birth date, created_at timestamptz)
as $$
  select g.id, g.rsvp_id, g.invited_by, p.name as inviter_name, g.name, g.email, g.date_of_birth, g.created_at
  from public.event_guests g
  join public.profiles p on p.id = g.invited_by
  where g.event_id = p_event_id
  order by g.created_at desc;
$$ language sql security definer;
