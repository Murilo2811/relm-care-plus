import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Env Vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
    console.log('🔍 Starting Backend Verification...\n');

    // 1. Test Login
    console.log('1️⃣  Testing Admin Login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@relm.com',
        password: 'password123'
    });

    if (authError) {
        console.error('   ❌ Login Failed:', authError.message);
        return;
    }
    console.log('   ✅ Login Success:', authData.user.email);

    // 2. Test Profile Fetch (DB Connection & Schema)
    console.log('\n2️⃣  Testing Profile Fetch (public.profiles)...');
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

    if (profileError) {
        console.error('   ❌ Profile Fetch Failed:', profileError.message);
    } else {
        console.log('   ✅ Profile Found:', profile.full_name, `(${profile.role})`);
        if (profile.role !== 'admin_relm') {
            console.warn('   ⚠️ WARNING: Role is NOT admin_relm:', profile.role);
        }
    }

    // 3. Test Dashboard Data (RLS)
    console.log('\n3️⃣  Testing Warranty Claims Access (RLS)...');
    const { data: claims, error: claimsError } = await supabase
        .from('warranty_claims')
        .select('id, status, customer_name')
        .limit(3);

    if (claimsError) {
        console.error('   ❌ Claims Fetch Failed (RLS Blocked?):', claimsError.message);
    } else {
        console.log(`   ✅ Claims Fetched: ${claims.length} items`);
        if (claims.length === 0) console.warn('   ⚠️ No claims found (Table might be empty or RLS hiding data)');
        else console.log('   -> Sample:', claims[0]);
    }

    // 4. Test Edge Function
    console.log('\n4️⃣  Testing Edge Function (admin-user-actions)...');
    const { data: fnData, error: fnError } = await supabase.functions.invoke('admin-user-actions', {
        body: {
            action: 'create', // Intentionally invalid to test auth/validation first, or valid dummy
            userData: {
                email: `test_verify_${Date.now()}@test.com`,
                password: 'password123',
                name: 'Test Verify User',
                role: 'loja',
                active: true
            }
        }
    });

    if (fnError) {
        console.error('   ❌ Function Call Failed:', fnError.message || fnError);
    } else {
        console.log('   ✅ Function Successful:', fnData);
    }
}

verify();
