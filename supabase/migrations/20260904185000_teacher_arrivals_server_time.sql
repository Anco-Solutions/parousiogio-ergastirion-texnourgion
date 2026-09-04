-- Server-side timestamps: the database, not the phone, is the source of truth for time.
alter table public.teacher_arrivals
  alter column scheduled_at set default now(),
  alter column arrival_at set default now(),
  alter column location_captured_at set default now();

-- Keep the arrival record immutable as to its capture time after insertion.
create or replace function public.prevent_teacher_arrival_capture_time_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    new.created_at := old.created_at;
    new.location_captured_at := old.location_captured_at;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_teacher_arrival_capture_time on public.teacher_arrivals;
create trigger trg_teacher_arrival_capture_time
before update on public.teacher_arrivals
for each row execute function public.prevent_teacher_arrival_capture_time_change();
