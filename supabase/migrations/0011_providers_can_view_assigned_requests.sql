-- Anbieter, die ein Angebot abgegeben haben (angenommen oder nicht), müssen die
-- Anfrage weiterhin sehen können, auch nachdem sie nicht mehr "offen" ist.
drop policy if exists "Providers with an offer can view the request" on public.requests;
create policy "Providers with an offer can view the request"
  on public.requests for select
  using (
    auth.uid() = helper_id
    or exists (
      select 1 from public.offers
      where offers.request_id = requests.id
        and offers.provider_id = auth.uid()
    )
  );
