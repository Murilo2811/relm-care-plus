-- ==============================================================================
-- STORE RECOVERY SCRIPT
-- PROJECT: tgfcwkfolmyaawscfovu
-- ==============================================================================

-- 1. Fix RLS Policy for Store Users (Switch from 'users' to 'profiles')
DROP POLICY IF EXISTS "Store sees own claims" ON warranty_claims;

CREATE POLICY "Store sees own claims" 
ON warranty_claims FOR SELECT 
USING (
  store_id IN (
    SELECT store_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- 2. Force-Update Store ID for the Test User
-- This ensures the frontend receives 'store-1' and RLS matches 'store-1'
UPDATE public.profiles
SET store_id = 'store-1'
WHERE email = 'loja@bikepoint.com';

-- 3. Verify Fix
SELECT email, role, store_id FROM public.profiles WHERE email = 'loja@bikepoint.com';
