drop policy if exists "Admins can view all requests" on public.requests;
create policy "Admins can view all requests"
  on public.requests for select
  using (exists (
    select 1 from public.profiles where id = auth.uid() and is_admin
  ));
