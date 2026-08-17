-- Die requests-Policy "Providers with an offer can view the request" prüft
-- offers, dessen eigene Policy wiederum requests prüft -> Endlosschleife.
-- Ein SECURITY DEFINER-Helfer umgeht die RLS-Prüfung von offers innerhalb
-- dieser einen Abfrage und durchbricht damit den Kreis.
create or replace function public.user_has_offer_on_request(p_request_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.offers
    where offers.request_id = p_request_id
      and offers.provider_id = auth.uid()
  );
$$;

drop policy if exists "Providers with an offer can view the request" on public.requests;
create policy "Providers with an offer can view the request"
  on public.requests for select
  using (
    auth.uid() = helper_id
    or public.user_has_offer_on_request(id)
  );
