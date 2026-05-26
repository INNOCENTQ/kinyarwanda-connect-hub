
-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  district TEXT,
  sector TEXT,
  village TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- LISTINGS
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  product_type TEXT NOT NULL,
  quantity NUMERIC,
  unit TEXT,
  price NUMERIC,
  currency TEXT DEFAULT 'RWF',
  image_urls TEXT[] DEFAULT '{}',
  district TEXT,
  sector TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT ALL ON public.listings TO service_role;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Listings viewable by everyone" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Users insert own listings" ON public.listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own listings" ON public.listings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own listings" ON public.listings FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_listings_updated BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_district ON public.listings(district);

-- DIAGNOSIS RECORDS
CREATE TABLE public.diagnosis_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  diagnosis_type TEXT NOT NULL,
  input_type TEXT NOT NULL,
  media_url TEXT,
  symptoms_text TEXT,
  ai_diagnosis TEXT,
  ai_treatment TEXT,
  ai_recommendations TEXT,
  confidence NUMERIC,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  weather_context JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnosis_records TO authenticated;
GRANT ALL ON public.diagnosis_records TO service_role;
ALTER TABLE public.diagnosis_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own diagnosis" ON public.diagnosis_records FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own diagnosis" ON public.diagnosis_records FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own diagnosis" ON public.diagnosis_records FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CHAT ROOMS
CREATE TABLE public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(listing_id, buyer_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_rooms TO authenticated;
GRANT ALL ON public.chat_rooms TO service_role;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view rooms" ON public.chat_rooms FOR SELECT TO authenticated USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers create rooms" ON public.chat_rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);

-- CHAT MESSAGES
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view messages" ON public.chat_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.chat_rooms r WHERE r.id = room_id AND (r.buyer_id = auth.uid() OR r.seller_id = auth.uid()))
);
CREATE POLICY "Participants send messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.chat_rooms r WHERE r.id = room_id AND (r.buyer_id = auth.uid() OR r.seller_id = auth.uid()))
);
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES
  ('livestock-photos', 'livestock-photos', true),
  ('livestock-audio', 'livestock-audio', true),
  ('listing-images', 'listing-images', true),
  ('crop-photos', 'crop-photos', true);

CREATE POLICY "Public read agri media" ON storage.objects FOR SELECT USING (
  bucket_id IN ('livestock-photos','livestock-audio','listing-images','crop-photos')
);
CREATE POLICY "Auth users upload agri media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id IN ('livestock-photos','livestock-audio','listing-images','crop-photos')
  AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Owners update agri media" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id IN ('livestock-photos','livestock-audio','listing-images','crop-photos')
  AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Owners delete agri media" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id IN ('livestock-photos','livestock-audio','listing-images','crop-photos')
  AND auth.uid()::text = (storage.foldername(name))[1]
);
