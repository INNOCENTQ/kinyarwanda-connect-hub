drop policy "public active ads" on public.ads;
create policy "anon active ads" on public.ads for select to anon using (active and (active_until is null or active_until > now()));
create policy "auth ads read" on public.ads for select to authenticated using ((active and (active_until is null or active_until > now())) or user_id = auth.uid() or public.has_role(auth.uid(),'admin'));