
-- ==============================================================================
-- ALLOW PUBLIC STORE SELECTION
-- PROJECT: Relm Care+
-- ==============================================================================

-- Allow anonymous users to select active stores for the public form
CREATE POLICY "stores_select_public" 
ON public.stores
FOR SELECT 
TO anon 
USING (active = true);

-- Optionally grant SELECT permission if not already granted (Supabase usually grants generic usage but good to be explicit for RLS to work)
GRANT SELECT ON public.stores TO anon;
