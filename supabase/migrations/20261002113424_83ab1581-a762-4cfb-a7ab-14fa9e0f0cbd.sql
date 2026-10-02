revoke execute on function public.has_role(uuid, app_role) from public, anon;
revoke execute on function public.is_premium(uuid) from public, anon;
revoke execute on function public.review_payment(uuid, boolean) from public, anon;
grant execute on function public.has_role(uuid, app_role) to authenticated;
grant execute on function public.is_premium(uuid) to authenticated;
grant execute on function public.review_payment(uuid, boolean) to authenticated;