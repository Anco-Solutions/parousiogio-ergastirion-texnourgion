create table if not exists public.workshop_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  geofence_radius_meters double precision not null default 100 check (geofence_radius_meters > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workshop_locations enable row level security;
drop policy if exists "Allow public read workshop locations" on public.workshop_locations;
create policy "Allow public read workshop locations" on public.workshop_locations for select to anon, authenticated using (active = true);
