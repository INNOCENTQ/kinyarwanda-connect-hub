create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create table public.subscriptions (user_id uuid primary key references auth.users(id) on delete cascade, plan text not null default 'premium', active_until timestamptz not null, updated_at timestamptz not null default now());
grant select on public.subscriptions to authenticated; grant all on public.subscriptions to service_role;
alter table public.subscriptions enable row level security;
create policy "own sub" on public.subscriptions for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.is_premium(_uid uuid) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.subscriptions where user_id=_uid and active_until > now()) $$;

create table public.vets (id uuid primary key default gen_random_uuid(), name text not null, phone text, district text, specialty text, fee integer not null default 3000, active boolean not null default true, created_at timestamptz not null default now());
grant select on public.vets to authenticated; grant insert, update, delete on public.vets to authenticated; grant all on public.vets to service_role;
alter table public.vets enable row level security;
create policy "read vets" on public.vets for select to authenticated using (active or public.has_role(auth.uid(),'admin'));
create policy "admin vets" on public.vets for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.ads (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, business_name text not null, title text not null, description text, phone text, link_url text, image_url text, active boolean not null default false, active_until timestamptz, created_at timestamptz not null default now());
grant select on public.ads to anon, authenticated; grant insert, update, delete on public.ads to authenticated; grant all on public.ads to service_role;
alter table public.ads enable row level security;
create policy "public active ads" on public.ads for select using ((active and (active_until is null or active_until > now())) or user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "submit ad" on public.ads for insert to authenticated with check (user_id = auth.uid() and active = false);
create policy "admin ads" on public.ads for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin del ads" on public.ads for delete to authenticated using (public.has_role(auth.uid(),'admin') or user_id = auth.uid());

alter table public.listings add column featured_until timestamptz;

create table public.vet_consultations (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, vet_id uuid references public.vets(id) on delete set null, description text not null, phone text not null, status text not null default 'pending', created_at timestamptz not null default now());
grant select, insert on public.vet_consultations to authenticated; grant all on public.vet_consultations to service_role;
alter table public.vet_consultations enable row level security;
create policy "own consult read" on public.vet_consultations for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own consult insert" on public.vet_consultations for insert to authenticated with check (user_id = auth.uid() and status = 'pending');

create table public.payment_requests (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, kind text not null check (kind in ('premium','featured','ad','vet')), reference_id uuid, amount integer not null, phone text not null, status text not null default 'pending', created_at timestamptz not null default now());
grant select, insert on public.payment_requests to authenticated; grant all on public.payment_requests to service_role;
alter table public.payment_requests enable row level security;
create policy "own pay read" on public.payment_requests for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own pay insert" on public.payment_requests for insert to authenticated with check (user_id = auth.uid() and status = 'pending');

create or replace function public.review_payment(_id uuid, _approve boolean) returns void language plpgsql security definer set search_path=public as $$
declare r public.payment_requests;
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'not allowed'; end if;
  select * into r from public.payment_requests where id=_id and status='pending';
  if not found then raise exception 'not found'; end if;
  update public.payment_requests set status = case when _approve then 'approved' else 'rejected' end where id=_id;
  if not _approve then
    if r.kind='vet' then update public.vet_consultations set status='rejected' where id=r.reference_id; end if;
    return;
  end if;
  if r.kind='premium' then
    insert into public.subscriptions(user_id, active_until) values (r.user_id, now() + interval '30 days')
    on conflict (user_id) do update set active_until = greatest(subscriptions.active_until, now()) + interval '30 days', updated_at=now();
  elsif r.kind='featured' then
    update public.listings set featured_until = greatest(coalesce(featured_until, now()), now()) + interval '7 days' where id=r.reference_id;
  elsif r.kind='ad' then
    update public.ads set active=true, active_until = now() + interval '30 days' where id=r.reference_id;
  elsif r.kind='vet' then
    update public.vet_consultations set status='confirmed' where id=r.reference_id;
  end if;
end $$;
revoke execute on function public.review_payment(uuid, boolean) from anon;

insert into public.user_roles(user_id, role) select id, 'admin' from auth.users where email='migambi@gmail.com' on conflict do nothing;