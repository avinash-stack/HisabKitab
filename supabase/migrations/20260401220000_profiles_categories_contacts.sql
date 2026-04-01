
-- PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  currency TEXT NOT NULL DEFAULT '₹',
  monthly_budget NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- EXPENSE CATEGORIES TABLE
CREATE TABLE public.expense_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📦',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own categories" ON public.expense_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own categories" ON public.expense_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.expense_categories FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_expense_categories_user ON public.expense_categories(user_id);

-- DEBT CONTACTS TABLE
CREATE TABLE public.debt_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.debt_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own contacts" ON public.debt_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own contacts" ON public.debt_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own contacts" ON public.debt_contacts FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_debt_contacts_user ON public.debt_contacts(user_id);
