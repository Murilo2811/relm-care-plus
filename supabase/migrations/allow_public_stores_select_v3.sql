
-- ==============================================================================
-- ALLOW PUBLIC STORE SELECTION (Recreate)
-- PROJECT: Relm Care+
-- ==============================================================================

-- Drop existing policy if present (to avoid conflict or bad definition)
DROP POLICY IF EXISTS "stores_select_public" ON public.stores;

-- Allow anonymous users to select active stores for the public form
-- Using 'is_active' column which exists
CREATE POLICY "stores_select_public" 
ON public.stores
FOR SELECT 
TO anon 
USING (is_active = true);

-- Grant SELECT permission
GRANT SELECT ON public.stores TO anon;
