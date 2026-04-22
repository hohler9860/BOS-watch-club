alter table public.interest_signups enable row level security;

create policy "Allow anonymous inserts"
  on public.interest_signups
  for insert
  to anon
  with check (true);

create policy "Allow admin reads"
  on public.interest_signups
  for select
  to authenticated
  using (true);
