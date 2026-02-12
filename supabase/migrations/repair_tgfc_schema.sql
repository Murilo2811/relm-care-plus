-- ==============================================================================
-- REPAIR SCRIPT FOR RELM CARE+ (Project: tgfcwkfolmyaawscfovu)
-- ==============================================================================

-- 1. Create 'profiles' table to replace insecure 'users' table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'loja', -- Values: 'admin_relm', 'gerente_relm', 'loja'
  store_id TEXT, -- Keeping as TEXT to match legacy store IDs
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Allow Admins to read all profiles
CREATE POLICY "Admins can read all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin_relm', 'gerente_relm')
  )
);

-- Allow Admins to update profiles
CREATE POLICY "Admins can update profiles" 
ON public.profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin_relm')
  )
);

-- 4. Auto-Sync Trigger (Auth -> Profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, is_active)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'name', 
    new.email, 
    'loja', -- Default role
    true
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safely recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Helper Function for Frontend RLS
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 6. Helper Function for Store ID
CREATE OR REPLACE FUNCTION public.get_my_store_id()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT store_id FROM public.profiles WHERE id = auth.uid();
$$;
