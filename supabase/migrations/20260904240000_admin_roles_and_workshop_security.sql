-- Admin roles and secure management of workshop locations.
-- Run this migration in the Supabase SQL Editor after deploying the app.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- Keep a profile automatically in sync for newly authenticated users.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

-- Existing workshop_locations table may already have been created manually.
alter table public.workshop_locations enable row level security;

drop policy if exists "workshop_locations_select_active" on public.workshop_locations;
create policy "workshop_locations_select_active"
on public.workshop_locations
for select
to anon, authenticated
using (active = true or public.is_admin());

drop policy if exists "workshop_locations_admin_insert" on public.workshop_locations;
create policy "workshop_locations_admin_insert"
on public.workshop_locations
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "workshop_locations_admin_update" on public.workshop_locations;
create policy "workshop_locations_admin_update"
on public.workshop_locations
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "workshop_locations_admin_delete" on public.workshop_locations;
create policy "workshop_locations_admin_delete"
on public.workshop_locations
for delete
to authenticated
using (public.is_admin());

-- Extend the existing immutable audit trail to workshop locations and arrivals.
do $$
declare
  t text;
begin
  foreach t in array array['workshop_locations', 'teacher_arrivals'] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop trigger if exists audit_%I on public.%I', t, t);
      execute format(
        'create trigger audit_%I after insert or update or delete on public.%I for each row execute function public.write_audit_log()',
        t, t
      );
    end if;
  end loop;
end $$;

comment on table public.profiles is 'Application users and their authorization role.';
comment on function public.is_admin() is 'Returns true only for an authenticated user whose profile role is admin.';
