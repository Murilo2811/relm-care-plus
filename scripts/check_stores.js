import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    console.log('--- CHECKING STORES TABLE ---');

    // 1. Fetch All Stores (Public Read Check)
    const { data: stores, error } = await supabase
        .from('stores')
        .select('*');

    if (error) {
        console.error('❌ Error fetching stores:', error.message);
    } else {
        console.log(`✅ Found ${stores.length} stores.`);
        if (stores.length > 0) {
            console.table(stores.map(s => ({ id: s.id, name: s.trade_name, email: s.contact_email })));
        } else {
            console.warn('⚠️ Table is empty!');
        }
    }
    console.log('--- END ---');
}

run();
