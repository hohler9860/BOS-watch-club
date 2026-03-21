-- Add status column to event_guests (pending until guest accepts)
alter table public.event_guests add column if not exists status text not null default 'pending';
