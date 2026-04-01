
-- Add avatar_url to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- INCOME SOURCES TABLE
CREATE TABLE public.income_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '💰',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own income sources" ON public.income_sources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own income sources" ON public.income_sources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own income sources" ON public.income_sources FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_income_sources_user ON public.income_sources(user_id);

-- INCOMES TABLE
CREATE TABLE public.incomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  source TEXT NOT NULL,
  note TEXT,
  income_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own incomes" ON public.incomes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own incomes" ON public.incomes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own incomes" ON public.incomes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own incomes" ON public.incomes FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_incomes_updated_at BEFORE UPDATE ON public.incomes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_incomes_user_date ON public.incomes(user_id, income_date);

-- AVATARS STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
