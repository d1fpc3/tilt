-- Tilt — initial schema (profiles, trades, emotion_logs)
-- Run via Supabase SQL editor or `supabase db push`.

create extension if not exists pgcrypto;

-- ─── profiles (extends auth.users) ─────────────────────
create table if not exists public.profiles (
  id                       uuid primary key references auth.users on delete cascade,
  email                    text,
  display_name             text,
  timezone                 text not null default 'America/New_York',
  plan                     text not null default 'free' check (plan in ('free','pro')),
  stripe_customer_id       text,
  stripe_subscription_id   text,
  plan_renews_at           timestamptz,
  weekly_report_day        int  not null default 0  check (weekly_report_day  between 0 and 6),
  weekly_report_hour       int  not null default 20 check (weekly_report_hour between 0 and 23),
  created_at               timestamptz not null default now()
);

-- Auto-insert a profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── trades ────────────────────────────────────────────
create table if not exists public.trades (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users on delete cascade,
  symbol        text not null,
  direction     text not null check (direction in ('LONG','SHORT')),
  quantity      numeric,
  entry_price   numeric,
  exit_price    numeric,
  pnl           numeric,
  date          date not null,
  entry_time    timestamptz,
  exit_time     timestamptz,
  session       text,
  setup         text,
  risk_amount   numeric,
  emotion_pre   text,
  emotion_post  text,
  grade         text check (grade in ('A','B','C')),
  mistakes      jsonb not null default '[]'::jsonb,
  notes         text,
  images        jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists trades_user_date_idx       on public.trades (user_id, date desc);
create index if not exists trades_user_entry_time_idx on public.trades (user_id, entry_time desc);

-- ─── emotion_logs ──────────────────────────────────────
create table if not exists public.emotion_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  logged_at   timestamptz not null default now(),
  context     text not null check (context in ('pre_market','mid_day','post_market','ad_hoc')),
  emotion     text not null,
  intensity   int  not null check (intensity between 1 and 5),
  trigger     text,
  notes       text
);

create index if not exists emotion_logs_user_logged_idx on public.emotion_logs (user_id, logged_at desc);
