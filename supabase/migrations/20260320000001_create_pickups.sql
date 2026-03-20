-- Recent member pickups (displayed on homepage Timepiece section)
create table if not exists pickups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ref text,
  eyebrow text default 'RECENTLY PICKED UP BY A MEMBER',
  editorial text,
  note text default 'MEMBER PICKUPS UPDATED REGULARLY',
  image1 text,
  image2 text,
  image3 text,
  active boolean default false,
  created_at timestamptz default now()
);

-- RLS: public read, admin write
alter table pickups enable row level security;

create policy "Public can read active pickups"
  on pickups for select
  using (true);

create policy "Admins can manage pickups"
  on pickups for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
