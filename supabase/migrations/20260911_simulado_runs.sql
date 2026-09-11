-- Histórico de simulados (colar no SQL Editor do Supabase).
-- Client-side only: SELECT + INSERT das próprias linhas. Sem UPDATE/DELETE.

create table if not exists public.simulado_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  track text not null check (track in ('ccna_v1', 'ccna_v2', 'aws')),
  total integer not null check (total > 0),
  acertos integer not null check (acertos >= 0 and acertos <= total),
  percentual integer not null check (percentual >= 0 and percentual <= 100),
  duration_seconds integer null check (
    duration_seconds is null or duration_seconds >= 0
  )
);

create index if not exists simulado_runs_user_created_idx
  on public.simulado_runs (user_id, created_at desc);

alter table public.simulado_runs enable row level security;

drop policy if exists "simulado_runs_select_own" on public.simulado_runs;
create policy "simulado_runs_select_own"
  on public.simulado_runs
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "simulado_runs_insert_own" on public.simulado_runs;
create policy "simulado_runs_insert_own"
  on public.simulado_runs
  for insert
  to authenticated
  with check (auth.uid() = user_id);
