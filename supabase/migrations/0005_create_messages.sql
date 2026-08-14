drop table if exists public.messages cascade;

-- Eine Unterhaltung ist eindeutig durch (request_id, responder_id) bestimmt:
-- der Ersteller der Anfrage und der jeweilige Helfer, der geantwortet hat.
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  responder_id uuid not null references public.profiles (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index messages_conversation_idx
  on public.messages (request_id, responder_id, created_at);

alter table public.messages enable row level security;

create policy "Conversation participants can view messages"
  on public.messages for select
  using (
    auth.uid() = responder_id
    or auth.uid() = (select user_id from public.requests where id = request_id)
  );

create policy "Conversation participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and (
      auth.uid() = responder_id
      or auth.uid() = (select user_id from public.requests where id = request_id)
    )
  );

-- Benachrichtigt die jeweils andere Person in der Unterhaltung
create function public.notify_on_new_message()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  request_owner uuid;
  recipient uuid;
  sender_name text;
begin
  select user_id into request_owner from public.requests where id = new.request_id;
  recipient := case
    when new.sender_id = request_owner then new.responder_id
    else request_owner
  end;
  select coalesce(full_name, 'Jemand') into sender_name
    from public.profiles where id = new.sender_id;

  insert into public.notifications (user_id, type, message, related_request_id)
  values (recipient, 'new_message', sender_name || ' hat dir eine Nachricht geschickt.', new.request_id);

  return new;
end;
$$;

create trigger on_message_created
  after insert on public.messages
  for each row execute procedure public.notify_on_new_message();
