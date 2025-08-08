-- Create academic_sessions table
create table if not exists public.academic_sessions (
  id uuid primary key default gen_random_uuid(),
  session_name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Enable RLS and allow all for now (matches current project policies)
alter table public.academic_sessions enable row level security;
create policy "Allow all operations on academic_sessions"
  on public.academic_sessions
  for all
  using (true)
  with check (true);

-- Ensure only one active session at a time via trigger
create or replace function public.ensure_single_active_session()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_active then
    update public.academic_sessions
      set is_active = false
      where id <> new.id and is_active = true;
  end if;
  return new;
end;
$$;

-- Apply trigger on insert and update
create or replace trigger trg_ensure_single_active_session
before insert or update on public.academic_sessions
for each row execute function public.ensure_single_active_session();

-- Add academic_session column to students, expenses, and fee_transactions
alter table public.students add column if not exists academic_session text;
create index if not exists idx_students_academic_session on public.students (academic_session);

alter table public.expenses add column if not exists academic_session text;
create index if not exists idx_expenses_academic_session on public.expenses (academic_session);

alter table public.fee_transactions add column if not exists academic_session text;
create index if not exists idx_fee_transactions_academic_session on public.fee_transactions (academic_session);
