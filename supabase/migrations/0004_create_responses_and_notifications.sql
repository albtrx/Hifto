drop table if exists public.responses cascade;
drop table if exists public.notifications cascade;

create table public.responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  responder_id uuid not null references public.profiles (id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index responses_request_id_idx on public.responses (request_id);
create index responses_responder_id_idx on public.responses (responder_id);

alter table public.responses enable row level security;

-- Ersteller der Anfrage und der Antwortende selbst dürfen die Antwort sehen
create policy "Request owners and responders can view responses"
  on public.responses for select
  using (
    auth.uid() = responder_id
    or auth.uid() = (select user_id from public.requests where id = request_id)
  );

-- Nur eingeloggte Nutzer, nicht auf die eigene Anfrage
create policy "Authenticated users can respond to others' requests"
  on public.responses for insert
  with check (
    auth.uid() = responder_id
    and auth.uid() <> (select user_id from public.requests where id = request_id)
  );

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  message text not null,
  related_request_id uuid references public.requests (id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can mark their own notifications as read"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Legt automatisch eine Benachrichtigung an, sobald jemand auf eine Anfrage antwortet
create function public.notify_on_new_response()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  request_owner uuid;
  responder_name text;
begin
  select user_id into request_owner from public.requests where id = new.request_id;
  select coalesce(full_name, 'Jemand') into responder_name
    from public.profiles where id = new.responder_id;

  insert into public.notifications (user_id, type, message, related_request_id)
  values (
    request_owner,
    'new_response',
    responder_name || ' möchte dir bei deiner Anfrage helfen.',
    new.request_id
  );

  return new;
end;
$$;

create trigger on_response_created
  after insert on public.responses
  for each row execute procedure public.notify_on_new_response();
