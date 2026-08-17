-- Auftrag-Status: neue Zwischenstufe "vergeben"
alter table public.requests drop constraint if exists requests_status_check;
alter table public.requests
  add constraint requests_status_check check (status in ('open', 'assigned', 'closed'));

-- Anbieter-Rolle & Architektur für spätere Verifizierung
alter table public.profiles
  add column if not exists is_provider boolean not null default false,
  add column if not exists is_verified boolean not null default false,
  add column if not exists company_name text,
  add column if not exists provider_categories text[] not null default '{}';

-- "responses" -> "offers": aus freier Antwort wird ein strukturiertes Angebot
alter table public.responses rename to offers;
alter table public.offers rename column responder_id to provider_id;
alter table public.offers
  add column if not exists price numeric(10, 2),
  add column if not exists availability text,
  add column if not exists estimated_duration text,
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected'));

-- Konsistente Benennung im Chat
alter table public.messages rename column responder_id to provider_id;

drop policy if exists "Request owners and responders can view responses" on public.offers;
drop policy if exists "Authenticated users can respond to others' requests" on public.offers;

create policy "Request owners and providers can view offers"
  on public.offers for select
  using (
    auth.uid() = provider_id
    or auth.uid() = (select user_id from public.requests where id = request_id)
  );

create policy "Authenticated users can submit offers on others' requests"
  on public.offers for insert
  with check (
    auth.uid() = provider_id
    and auth.uid() <> (select user_id from public.requests where id = request_id)
  );

-- Neu: Ersteller darf den Status eines Angebots ändern (annehmen/ablehnen)
drop policy if exists "Request owners can update offer status" on public.offers;
create policy "Request owners can update offer status"
  on public.offers for update
  using (auth.uid() = (select user_id from public.requests where id = request_id));

-- Benachrichtigungs-Trigger auf "offers" umstellen
drop trigger if exists on_response_created on public.offers;
drop function if exists public.notify_on_new_response();

create function public.notify_on_new_offer()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  request_owner uuid;
  provider_name text;
begin
  select user_id into request_owner from public.requests where id = new.request_id;
  select coalesce(full_name, 'Ein Anbieter') into provider_name
    from public.profiles where id = new.provider_id;

  insert into public.notifications (user_id, type, message, related_request_id)
  values (
    request_owner,
    'new_offer',
    provider_name || ' hat dir ein Angebot gemacht.',
    new.request_id
  );

  return new;
end;
$$;

create trigger on_offer_created
  after insert on public.offers
  for each row execute procedure public.notify_on_new_offer();

-- Neu: Benachrichtigung, wenn ein Angebot angenommen wird
drop trigger if exists on_offer_status_changed on public.offers;
drop function if exists public.notify_on_offer_accepted();

create function public.notify_on_offer_accepted()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    insert into public.notifications (user_id, type, message, related_request_id)
    values (
      new.provider_id,
      'offer_accepted',
      'Dein Angebot wurde angenommen!',
      new.request_id
    );
  end if;
  return new;
end;
$$;

create trigger on_offer_status_changed
  after update on public.offers
  for each row execute procedure public.notify_on_offer_accepted();
