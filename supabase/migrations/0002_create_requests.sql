-- Vorherigen (evtl. unvollständigen) Stand entfernen, damit das Skript
-- gefahrlos erneut ausgeführt werden kann
drop policy if exists "Open requests are viewable by everyone" on public.requests;
drop policy if exists "Owners can view their own requests" on public.requests;
drop policy if exists "Authenticated users can create requests" on public.requests;
drop policy if exists "Owners can update their own requests" on public.requests;
drop policy if exists "Owners can delete their own requests" on public.requests;
drop table if exists public.requests;

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null,
  category text not null check (
    category in (
      'zuhause', 'reparatur', 'transport', 'hilfe', 'events',
      'tiere', 'technik', 'lernen', 'freizeit', 'sonstiges'
    )
  ),
  location text not null,
  needed_at timestamptz,
  budget_amount numeric(10, 2),
  budget_currency text not null default 'CHF' check (budget_currency in ('CHF', 'EUR')),
  image_url text,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

create index requests_created_at_idx on public.requests (created_at desc);
create index requests_status_idx on public.requests (status);
create index requests_category_idx on public.requests (category);

alter table public.requests enable row level security;

-- Offene Anfragen sind für alle sichtbar (auch ohne Login, für "Entdecken")
create policy "Open requests are viewable by everyone"
  on public.requests for select
  using (status = 'open');

-- Ersteller sehen auch ihre eigenen geschlossenen Anfragen
create policy "Owners can view their own requests"
  on public.requests for select
  using (auth.uid() = user_id);

-- Nur eingeloggte Nutzer können Anfragen erstellen, nur für sich selbst
create policy "Authenticated users can create requests"
  on public.requests for insert
  with check (auth.uid() = user_id);

create policy "Owners can update their own requests"
  on public.requests for update
  using (auth.uid() = user_id);

create policy "Owners can delete their own requests"
  on public.requests for delete
  using (auth.uid() = user_id);

-- Storage-Bucket für optionale Anfrage-Bilder
insert into storage.buckets (id, name, public)
values ('request-images', 'request-images', true)
on conflict (id) do nothing;

drop policy if exists "Request images are publicly viewable" on storage.objects;
drop policy if exists "Users can upload their own request images" on storage.objects;
drop policy if exists "Users can delete their own request images" on storage.objects;

create policy "Request images are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'request-images');

-- Bilder müssen im eigenen Ordner (Nutzer-ID als Präfix) liegen
create policy "Users can upload their own request images"
  on storage.objects for insert
  with check (
    bucket_id = 'request-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own request images"
  on storage.objects for delete
  using (
    bucket_id = 'request-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
