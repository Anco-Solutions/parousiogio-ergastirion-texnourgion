-- Teacher arrival / delay tracking with server timestamps and GPS evidence.
create table if not exists public.teacher_arrivals (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid,
  scheduled_at timestamptz not null,
  arrival_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled','delay_declared','arrived','rejected')),
  delay_minutes integer not null default 0 check (delay_minutes >= 0),
  delay_reason text,
  latitude double precision,
  longitude double precision,
  gps_accuracy_meters double precision,
  distance_meters double precision,
  geofence_radius_meters double precision,
  geofence_passed boolean,
  location_captured_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists teacher_arrivals_teacher_id_idx on public.teacher_arrivals (teacher_id);
create index if not exists teacher_arrivals_scheduled_at_idx on public.teacher_arrivals (scheduled_at);
create index if not exists teacher_arrivals_arrival_at_idx on public.teacher_arrivals (arrival_at);

alter table public.teacher_arrivals enable row level security;

-- Initial policy for the current public app shell. Once teacher authentication is enabled,
-- this policy will be tightened to the authenticated teacher's own rows.
drop policy if exists "Allow public teacher arrival access" on public.teacher_arrivals;
create policy "Allow public teacher arrival access"
on public.teacher_arrivals
for all
to anon, authenticated
using (true)
with check (true);

create or replace function public.set_teacher_arrival_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists teacher_arrivals_updated_at on public.teacher_arrivals;
create trigger teacher_arrivals_updated_at
before update on public.teacher_arrivals
for each row execute function public.set_teacher_arrival_updated_at();
