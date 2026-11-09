CREATE POLICY "admin view profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update listings" ON public.listings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete listings" ON public.listings FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin view roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(user_id uuid, email text, full_name text, phone text, district text, created_at timestamptz, last_sign_in_at timestamptz, is_admin boolean, listings bigint, diagnoses bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY SELECT u.id, u.email::text, p.full_name, p.phone, p.district, u.created_at, u.last_sign_in_at,
    EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=u.id AND r.role='admin'),
    (SELECT count(*) FROM public.listings l WHERE l.user_id=u.id),
    (SELECT count(*) FROM public.diagnosis_records d WHERE d.user_id=u.id)
  FROM auth.users u LEFT JOIN public.profiles p ON p.user_id=u.id ORDER BY u.created_at DESC;
END $$;
REVOKE ALL ON FUNCTION public.admin_list_users() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_admin(_user uuid, _make boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _user = auth.uid() AND NOT _make THEN RAISE EXCEPTION 'cannot remove self'; END IF;
  IF _make THEN INSERT INTO public.user_roles(user_id,role) VALUES (_user,'admin') ON CONFLICT DO NOTHING;
  ELSE DELETE FROM public.user_roles WHERE user_id=_user AND role='admin'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.admin_set_admin(uuid,boolean) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_admin(uuid,boolean) TO authenticated;