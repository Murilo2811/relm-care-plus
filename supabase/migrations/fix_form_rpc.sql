-- ==============================================================================
-- FIX PUBLIC FORM SUBMISSION (RPC Pattern)
-- PROJECT: tgfcwkfolmyaawscfovu
-- ==============================================================================

-- 1. Fix Missing Default ID (Critical for Insert)
-- If the table was created without "default gen_random_uuid()", inserts fail.
ALTER TABLE public.warranty_claims 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Create Secure Function for Public Submissions
-- usage: supabase.rpc('create_public_claim', { claim_data: { ... } })
CREATE OR REPLACE FUNCTION public.create_public_claim(claim_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges (Bypasses RLS)
AS $$
DECLARE
  new_record jsonb;
BEGIN
  INSERT INTO public.warranty_claims (
    protocol_number,
    status,
    link_status,
    customer_name,
    customer_phone,
    customer_email,
    item_type,
    product_description,
    serial_number,
    invoice_number,
    purchase_date,
    purchase_store_name,
    created_at,
    updated_at
  )
  VALUES (
    claim_data->>'protocol_number',
    'RECEBIDO',
    'PENDING_REVIEW',
    claim_data->>'customer_name',
    claim_data->>'customer_phone',
    claim_data->>'customer_email',
    claim_data->>'item_type',
    claim_data->>'product_description',
    claim_data->>'serial_number',
    claim_data->>'invoice_number',
    (claim_data->>'purchase_date')::date,
    claim_data->>'purchase_store_name',
    now(),
    now()
  )
  RETURNING to_jsonb(warranty_claims.*) INTO new_record;

  RETURN new_record;
END;
$$;

-- 3. Grant Permissions
GRANT EXECUTE ON FUNCTION public.create_public_claim TO anon, authenticated;
