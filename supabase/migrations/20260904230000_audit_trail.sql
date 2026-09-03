-- Audit trail for the Attendance application
-- Records who changed what, when, and the before/after values.

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id text,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists audit_logs_changed_at_idx
  on public.audit_logs (changed_at desc);

create index if not exists audit_logs_table_record_idx
  on public.audit_logs (table_name, record_id, changed_at desc);

alter table public.audit_logs enable row level security;

-- Authenticated users may read the history; there are deliberately no
-- client INSERT/UPDATE/DELETE policies. History is written by triggers.
drop policy if exists "audit_logs_select_authenticated" on public.audit_logs;
create policy "audit_logs_select_authenticated"
on public.audit_logs
for select
to authenticated
using (true);

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_json jsonb;
  new_json jsonb;
  record_key text;
begin
  old_json := case when TG_OP in ('UPDATE', 'DELETE') then to_jsonb(OLD) else null end;
  new_json := case when TG_OP in ('INSERT', 'UPDATE') then to_jsonb(NEW) else null end;

  record_key := coalesce(new_json->>'id', old_json->>'id');

  insert into public.audit_logs (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    changed_at,
    changed_by,
    metadata
  ) values (
    TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
    record_key,
    TG_OP,
    old_json,
    new_json,
    now(),
    auth.uid(),
    jsonb_build_object('source', 'database_trigger')
  );

  return coalesce(NEW, OLD);
end;
$$;

-- Apply the same immutable audit mechanism to every business table.
do $$
declare
  t text;
begin
  foreach t in array array[
    'academic',
    'attendance_records',
    'sessions',
    'classes',
    'groups',
    'lesson_periods',
    'schedule',
    'semesters',
    'student_groups',
    'students',
    'subjects',
    'teacher_groups',
    'teachers'
  ] loop
    execute format('drop trigger if exists audit_%I on public.%I', t, t);
    execute format(
      'create trigger audit_%I after insert or update or delete on public.%I for each row execute function public.write_audit_log()',
      t, t
    );
  end loop;
end $$;

comment on table public.audit_logs is
  'Immutable audit history for controlled application records: who changed what, when, and before/after values.';
