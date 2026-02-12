import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    console.log('--- STORE TEST START ---');

    // 1. Login as Store
    console.log('1. Logging in as Store User (loja@bikepoint.com)...');
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email: 'loja@bikepoint.com',
        password: 'password123'
    });

    if (error) {
        console.error('❌ Login Failed:', error.message);
        // Try creating/resetting if failed (Store user might not exist yet in new project)
        return;
    }
    console.log('✅ Login Success. User ID:', user.id);

    // 2. Check Profile & Store ID
    console.log('\n2. Fetching Profile...');
    const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (pError) {
        console.error('❌ Profile Fetch Error:', pError.message);
    } else {
        console.log('✅ Profile Found:', { role: profile.role, store_id: profile.store_id });
        if (!profile.store_id) console.warn('⚠️ WARNING: store_id is NULL. This user wont see any data.');
    }

    // 3. Check Claims Visibility
    console.log('\n3. Fetching Warranty Claims...');
    const { data: claims, error: cError } = await supabase
        .from('warranty_claims')
        .select('id, store_id')
        .limit(5);

    if (cError) {
        console.error('❌ Claims Fetch Error (RLS):', cError.message);
    } else {
        console.log(`✅ Claims Visible: ${claims.length}`);
        if (claims.length === 0) console.warn('⚠️ Zero claims found. Either table is empty, or RLS is blocking everything.');
        else console.table(claims);
    }

    // 4. Fetch Store Details (Mimic Dashboard)
    console.log('\n4. Fetching Store Details (Like Dashboard)...');
    if (profile.store_id) {
        const { data: storeInfo, error: sError } = await supabase
            .from('stores')
            .select('*')
            .eq('id', profile.store_id)
            .single();

        if (sError) console.error('❌ Store Info Error:', sError.message);
        else console.log('✅ Store Info Loaded:', { name: storeInfo.trade_name, city: storeInfo.city });
    } else {
        console.warn('⚠️ Skipping Store Info check (No store_id)');
    }

    console.log('--- STORE TEST END ---');
}

run();
