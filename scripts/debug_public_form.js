import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    console.log('--- DEBUGGING PUBLIC FORM ---');

    const payload = {
        protocol_number: `TEST-${Date.now()}`,
        customer_name: 'Debug User',
        customer_phone: '11999999999',
        status: 'RECEBIDO',
        link_status: 'PENDING_REVIEW'
    };

    // Test 1: Insert ONLY (No Return) - Should PASS if INSERT policy works
    console.log('\n1. Testing INSERT ONLY (No Return)...');
    const { error: insertError } = await supabase
        .from('warranty_claims')
        .insert([payload]); // No .select()

    if (insertError) {
        console.error('❌ Insert Only Failed:', insertError.message);
    } else {
        console.log('✅ Insert Only SUCCESS! (Policy allows creation)');
    }

    // Test 2: Insert + Select (What Frontend does) - Suspect FAIL
    console.log('\n2. Testing INSERT + SELECT...');
    const payload2 = { ...payload, protocol_number: `TEST-RET-${Date.now()}` };
    const { data, error: returnError } = await supabase
        .from('warranty_claims')
        .insert([payload2])
        .select()
        .single();

    if (returnError) {
        console.error('❌ Insert + Select Failed:', returnError.message);
        console.log('   (This confirms we need SELECT permission or an RPC function)');
    } else {
        console.log('✅ Insert + Select SUCCESS:', data.id);
    }

    console.log('--- END ---');
}

run();
