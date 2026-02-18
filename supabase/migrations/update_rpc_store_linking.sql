
-- ==============================================================================
-- UPDATE PUBLIC FORM RPC (Add Store Linking)
-- PROJECT: Relm Care+
-- ==============================================================================

-- Update the function to accept and insert store_id and purchase_store_state
CREATE OR REPLACE FUNCTION public.create_public_claim(claim_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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
    purchase_state, -- Map to correct column name (check schema if it varies)
    store_id,
    created_at,
    updated_at
  )
  VALUES (
    claim_data->>'protocol_number',
    'RECEBIDO',
    -- If store_id is provided, set link_status to LINKED_AUTO, else PENDING_REVIEW
    CASE 
      WHEN (claim_data->>'store_id') IS NOT NULL AND (claim_data->>'store_id') != '' THEN 'LINKED_AUTO'
      ELSE 'PENDING_REVIEW'
    END,
    claim_data->>'customer_name',
    claim_data->>'customer_phone',
    claim_data->>'customer_email',
    claim_data->>'item_type',
    claim_data->>'product_description',
    claim_data->>'serial_number',
    claim_data->>'invoice_number',
    (claim_data->>'purchase_date')::date,
    claim_data->>'purchase_store_name',
    claim_data->>'purchase_store_state',
    NULLIF(claim_data->>'store_id', '')::uuid, -- Cast to UUID, handle empty string as NULL
    now(),
    now()
  )
  RETURNING to_jsonb(warranty_claims.*) INTO new_record;

  RETURN new_record;
END;
$$;

-- Ensure permissions are set
GRANT EXECUTE ON FUNCTION public.create_public_claim TO anon, authenticated;
