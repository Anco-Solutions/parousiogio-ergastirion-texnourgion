-- Attendance verification: server timestamp + device position.
-- Coordinates are captured at the moment of the attendance action.
alter table public.attendance_records
  add column if not exists recorded_at timestamptz not null default now(),
  add column if not exists position_latitude double precision,
  add column if not exists position_longitude double precision,
  add column if not exists position_accuracy_m double precision,
  add column if not exists position_captured_at timestamptz,
  add column if not exists position_distance_m double precision,
  add column if not exists position_verified boolean not null default false;

-- A configurable location for each teaching/lab site.
create table if not exists public.attendance_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  radius_meters integer not null default 100 check (radius_meters > 0 and radius_meters <= 10000),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.attendance_locations is 'Configured lab locations and allowed geofence radius for attendance.';
comment on column public.attendance_records.recorded_at is 'Authoritative server timestamp for the attendance action.';
comment on column public.attendance_records.position_latitude is 'Latitude captured from the device at attendance time.';
comment on column public.attendance_records.position_longitude is 'Longitude captured from the device at attendance time.';
comment on column public.attendance_records.position_accuracy_m is 'Device-reported GPS accuracy in meters.';
comment on column public.attendance_records.position_distance_m is 'Calculated distance from the configured attendance location in meters.';
comment on column public.attendance_records.position_verified is 'True only when the captured position is inside the configured radius.';
