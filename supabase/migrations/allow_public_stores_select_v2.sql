
-- ==============================================================================
-- ALLOW PUBLIC STORE SELECTION (Corrected)
-- PROJECT: Relm Care+
-- ==============================================================================

-- Allow anonymous users to select active stores for the public form
-- Using 'is_active' column which exists
CREATE POLICY "stores_select_public" 
ON public.stores
FOR SELECT 
TO anon 
USING (is_active = true);

-- Enable RLS on table if not enabled (it is enabled already but good practice)
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Grant SELECT permission
GRANT SELECT ON public.stores TO anon;
