-- ==============================================================================
-- REPAIR SCRIPT V2 (Fixes Infinite Recursion)
-- PROJECT: tgfcwkfolmyaawscfovu
-- ==============================================================================

-- 1. Helper function to safely check role without RLS recursion
-- SECURITY DEFINER means it runs with owner privileges, bypassing RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('admin_relm', 'gerente_relm')
  );
$$;

-- 2. Drop existing policies to be safe
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

-- 3. Re-create Policies using the Helper Function
-- Own Profile: Simple ID check (No recursion)
CREATE POLICY "Users can read own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Admins: Use the SECURITY DEFINER function to break the loop
CREATE POLICY "Admins can read all profiles" 
ON public.profiles FOR SELECT 
USING ( public.is_admin() );

CREATE POLICY "Admins can update profiles" 
ON public.profiles FOR UPDATE
USING ( public.is_admin() );

-- 4. Ensure Policies on WARRANTIES don't recurse either
-- (Assuming they use store_id from profile, let's make a safe helper for that too if needed)
-- But usually, "Store sees own claims" uses a subquery. 
-- Let's make sure 'get_my_store_id' is used there or a similar safe pattern.

-- 5. Fix Permission Grant (Just in case)
GRANT SELECT, UPDATE, INSERT ON public.profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
