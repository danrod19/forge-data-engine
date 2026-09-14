-- Histórico persistente de simulados (colar no SQL Editor do Supabase).
-- Tabela nova: public.simulado_attempts
-- Não substitui automaticamente public.simulado_runs (legado 2026-09-11), se existir.
-- Client: SELECT + INSERT das próprias linhas. Sem UPDATE/DELETE.

create table if not exists public.simulado_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  track text not null check (track in ('ccna1', 'ccna2', 'aws')),
  n_questoes integer not null check (n_questoes > 0),
  acertos integer not null check (acertos >= 0 and acertos <= n_questoes),
  percentual numeric(5, 2) generated always as (
    round((acertos::numeric * 100 / n_questoes), 2)
  ) stored,
  duration_seconds integer null check (
    duration_seconds is null or duration_seconds >= 0
  ),
  created_at timestamptz not null default now()
);

create index if not exists simulado_attempts_user_created_idx
  on public.simulado_attempts (user_id, created_at desc);

alter table public.simulado_attempts enable row level security;

drop policy if exists "simulado_attempts_select_own" on public.simulado_attempts;
create policy "simulado_attempts_select_own"
  on public.simulado_attempts
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "simulado_attempts_insert_own" on public.simulado_attempts;
create policy "simulado_attempts_insert_own"
  on public.simulado_attempts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

revoke all on table public.simulado_attempts from public;
revoke all on table public.simulado_attempts from anon;
grant select, insert on table public.simulado_attempts to authenticated;
