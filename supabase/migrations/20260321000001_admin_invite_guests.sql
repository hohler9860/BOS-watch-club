-- Allow admin-invited guests (no RSVP needed)
alter table public.event_guests alter column rsvp_id drop not null;

-- Drop the existing unique constraint and add a partial one (only for non-null rsvp_id)
alter table public.event_guests drop constraint if exists event_guests_rsvp_id_key;
create unique index if not exists event_guests_rsvp_id_unique on public.event_guests (rsvp_id) where rsvp_id is not null;

-- Allow admins to insert guests directly
create policy "Admins can insert guests"
  on public.event_guests for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));
