-- ==============================================================================
-- UNLOCK DATA ACCESS (WARRANTY CLAIMS)
-- ==============================================================================

-- 1. Ensure Admins can see ALL claims
DROP POLICY IF EXISTS "Admins can see all claims" ON warranty_claims;
CREATE POLICY "Admins can see all claims" 
ON warranty_claims FOR SELECT 
USING ( public.is_admin() );

-- 2. Ensure Admins can update claims
DROP POLICY IF EXISTS "Admins can update all claims" ON warranty_claims;
CREATE POLICY "Admins can update all claims" 
ON warranty_claims FOR UPDATE 
USING ( public.is_admin() );

-- 3. Ensure Events are visible
DROP POLICY IF EXISTS "Admins see all events" ON warranty_events;
CREATE POLICY "Admins see all events" 
ON warranty_events FOR SELECT 
USING ( public.is_admin() );
