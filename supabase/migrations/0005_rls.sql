-- Tilt — RLS policies (Phase 1 tables only; AI tables added in 0002).

alter table public.profiles      enable row level security;
alter table public.trades        enable row level security;
alter table public.emotion_logs  enable row level security;

-- profiles: id == auth.uid()
drop policy if exists "profiles select own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles select own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- trades: user_id == auth.uid(), full CRUD
drop policy if exists "trades all own" on public.trades;
create policy "trades all own" on public.trades
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- emotion_logs: user_id == auth.uid(), full CRUD
drop policy if exists "emotion_logs all own" on public.emotion_logs;
create policy "emotion_logs all own" on public.emotion_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
