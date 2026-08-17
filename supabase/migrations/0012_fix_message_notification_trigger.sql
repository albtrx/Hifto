-- notify_on_new_message() wurde bei der responses->offers-Umbenennung übersehen
-- und referenzierte noch die alte Spalte responder_id (jetzt provider_id),
-- wodurch jede Nachricht mit einem Datenbankfehler fehlschlug.
create or replace function public.notify_on_new_message()
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
    when new.sender_id = request_owner then new.provider_id
    else request_owner
  end;
  select coalesce(full_name, 'Jemand') into sender_name
    from public.profiles where id = new.sender_id;

  insert into public.notifications (user_id, type, message, related_request_id)
  values (recipient, 'new_message', sender_name || ' hat dir eine Nachricht geschickt.', new.request_id);

  return new;
end;
$$;
