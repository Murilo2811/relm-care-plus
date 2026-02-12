-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all operations for now" ON stores;
DROP POLICY IF EXISTS "Allow all operations for now" ON users;
DROP POLICY IF EXISTS "Allow all operations for now" ON warranty_claims;
DROP POLICY IF EXISTS "Allow all operations for now" ON warranty_events;

--------------------------------------------------------------------------------
-- 1. STORES
-- Read: Everyone (Public Store List)
-- Write: Only Admins (Supabase Auth logic needed, for now blocked)
--------------------------------------------------------------------------------
CREATE POLICY "Public Read Stores" ON stores FOR SELECT USING (true);

--------------------------------------------------------------------------------
-- 2. USERS
-- Read: Only own profile or Admins
-- Write: Only own profile
--------------------------------------------------------------------------------
CREATE POLICY "Read Own Profile" 
ON users FOR SELECT 
USING (auth.uid()::text = id);

-- Note: We cast auth.uid() UUID to text because our 'users.id' is TEXT (from mock legacy)
-- Ideally we would migrate users.id to UUID eventually.

--------------------------------------------------------------------------------
-- 3. WARRANTY CLAIMS
-- Read: 
--   a) Stores can read claims linked to their Store ID
--   b) Admin can read all (Implement 'is_admin' function or logic later)
--   c) Public (by Protocol) - This is tricky with RLS. 
--      Usually Public Access is done via specific "SECURITY DEFINER" functions 
--      to bypass RLS for a specific lookup (Search by Protocol), 
--      OR we allow SELECT if you know the protocol (but listing all is blocked).
--------------------------------------------------------------------------------

-- Policy: Stores see their own claims
CREATE POLICY "Store sees own claims" 
ON warranty_claims FOR SELECT 
USING (
  store_id IN (
    SELECT store_id FROM users WHERE id = auth.uid()::text
  )
);

-- Policy: Allow creating claims (Public Form)
CREATE POLICY "Public Create Claims" 
ON warranty_claims FOR INSERT 
WITH CHECK (true); 
-- Note: 'WITH CHECK (true)' lets anyone insert, but they can't SELECT result back 
-- unless another policy allows it (which is good for privacy).

--------------------------------------------------------------------------------
-- 4. WARRANTY EVENTS
-- Read: Related to claims visible to the user
--------------------------------------------------------------------------------
CREATE POLICY "See events for accessible claims" 
ON warranty_events FOR SELECT 
USING (
  claim_id IN (
    SELECT id FROM warranty_claims
  )
);
