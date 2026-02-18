
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    console.log('URL:', supabaseUrl);
    console.log('KEY:', supabaseKey ? 'Has Key' : 'Missing Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('--- Verifying Stores (RLS Check) ---');
    const { data: stores, error: storeError } = await supabase
        .from('stores')
        .select('*');

    if (storeError) {
        console.error('FAILED to list stores:', storeError.message);
        console.error('Hint: Check RLS policies for table "stores". Public access needed?');
    } else {
        console.log(`Success! Found ${stores.length} stores.`);
        if (stores.length > 0) {
            console.log('Sample store:', stores[0].trade_name);
        } else {
            console.warn('Warning: Store list is empty. This explains why the dropdown is empty.');
        }
    }

    console.log('\n--- Verifying create_public_claim RPC ---');
    const payload = {
        protocol_number: `TEST-${Date.now()}`,
        customer_name: 'Test Debugger',
        customer_phone: '11999999999',
        customer_email: 'test@debug.com',
        item_type: 'Bike',
        product_description: 'Debug Bike',
        serial_number: 'DEBUG-123',
        invoice_number: '123456',
        purchase_date: '2023-01-01',
        purchase_store_name: 'Debug Store',
        purchase_store_state: 'SP',
        store_id: stores && stores.length > 0 ? stores[0].id : undefined
    };

    console.log('Payload:', JSON.stringify(payload, null, 2));

    const { data: claim, error: rpcError } = await supabase
        .rpc('create_public_claim', { claim_data: payload });

    if (rpcError) {
        console.error('FAILED to create claim via RPC:', rpcError.message);
        if (rpcError.message.includes('function') && rpcError.message.includes('does not exist')) {
            console.error('CRITICAL: RPC function signature mismatch or missing.');
        }
    } else {
        console.log('Success! Claim created with ID:', claim.id);
        console.log('Returned store_id:', claim.store_id);
        console.log('Returned state:', claim.purchase_state);
    }
}

verify();
