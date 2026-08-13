-- Vorherigen (evtl. unvollständigen) Stand entfernen, damit das Skript
-- gefahrlos erneut ausgeführt werden kann
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.profiles;

-- Profiltabelle: eine Zeile pro registriertem Nutzer, verknüpft mit Supabase Auth
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  city text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Profile sind öffentlich sichtbar (Name, Stadt, Bio, Bewertungen etc.)
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- Nutzer dürfen nur ihr eigenes Profil bearbeiten
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Legt automatisch eine Profilzeile an, sobald sich jemand registriert
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
