alter table public.requests
  add column if not exists helper_id uuid references public.profiles (id) on delete set null;

drop table if exists public.reviews cascade;

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  reviewee_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  reliability smallint check (reliability between 1 and 5),
  friendliness smallint check (friendliness between 1 and 5),
  quality smallint check (quality between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (request_id, reviewer_id)
);

create index reviews_reviewee_id_idx on public.reviews (reviewee_id);

alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using (true);

-- Nur die zwei Beteiligten einer abgeschlossenen, erfolgreichen Vermittlung
-- dürfen sich gegenseitig bewerten (je Anfrage einmal, siehe unique oben)
create policy "Participants of a successful match can leave one review each"
  on public.reviews for insert
  with check (
    auth.uid() = reviewer_id
    and exists (
      select 1 from public.requests r
      where r.id = request_id
        and r.status = 'closed'
        and (
          (r.user_id = reviewer_id and r.helper_id = reviewee_id)
          or (r.helper_id = reviewer_id and r.user_id = reviewee_id)
        )
    )
  );

-- Avatar-Bilder für Profile
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatars are publicly viewable" on storage.objects;
drop policy if exists "Users can upload their own avatar" on storage.objects;
drop policy if exists "Users can update their own avatar" on storage.objects;
drop policy if exists "Users can delete their own avatar" on storage.objects;

create policy "Avatars are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
