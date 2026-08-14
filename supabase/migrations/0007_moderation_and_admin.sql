alter table public.profiles
  add column if not exists is_admin boolean not null default false,
  add column if not exists is_banned boolean not null default false;

alter table public.requests
  add column if not exists is_hidden boolean not null default false;

-- Öffentliche Sichtbarkeit von Anfragen: jetzt zusätzlich "nicht verborgen"
drop policy if exists "Open requests are viewable by everyone" on public.requests;
create policy "Open requests are viewable by everyone"
  on public.requests for select
  using (status = 'open' and not is_hidden);

-- Admins dürfen jede Anfrage bearbeiten/löschen (verbergen, entfernen)
drop policy if exists "Admins can update any request" on public.requests;
create policy "Admins can update any request"
  on public.requests for update
  using (exists (
    select 1 from public.profiles where id = auth.uid() and is_admin
  ));

drop policy if exists "Admins can delete any request" on public.requests;
create policy "Admins can delete any request"
  on public.requests for delete
  using (exists (
    select 1 from public.profiles where id = auth.uid() and is_admin
  ));

-- Admins dürfen jedes Profil sperren/entsperren
drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  using (exists (
    select 1 from public.profiles p2 where p2.id = auth.uid() and p2.is_admin
  ));

-- Nutzer blockieren
drop table if exists public.blocks cascade;

create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id)
);

alter table public.blocks enable row level security;

create policy "Users manage their own blocks"
  on public.blocks for all
  using (auth.uid() = blocker_id)
  with check (auth.uid() = blocker_id);

-- Melde-Funktion: Anfragen oder Nutzer melden
drop table if exists public.reports cascade;

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_request_id uuid references public.requests (id) on delete cascade,
  reported_user_id uuid references public.profiles (id) on delete cascade,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now(),
  check (reported_request_id is not null or reported_user_id is not null)
);

alter table public.reports enable row level security;

create policy "Users can create reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "Reporters and admins can view reports"
  on public.reports for select
  using (
    auth.uid() = reporter_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin)
  );

create policy "Admins can update reports"
  on public.reports for update
  using (exists (
    select 1 from public.profiles where id = auth.uid() and is_admin
  ));
