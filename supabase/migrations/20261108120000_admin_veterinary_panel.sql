-- Give administrators a narrowly scoped, server-checked way to resolve veterinary consultation requests.
create or replace function public.review_vet_consultation(_id uuid, _status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'not allowed';
  end if;
  if _status not in ('confirmed', 'rejected') then
    raise exception 'invalid status';
  end if;

  update public.vet_consultations
  set status = _status
  where id = _id and status = 'pending';

  if not found then
    raise exception 'consultation not found or already reviewed';
  end if;
end;
$$;

revoke all on function public.review_vet_consultation(uuid, text) from public;
revoke all on function public.review_vet_consultation(uuid, text) from anon;
grant execute on function public.review_vet_consultation(uuid, text) to authenticated;

create index if not exists vet_consultations_created_at_idx
  on public.vet_consultations (created_at desc);
