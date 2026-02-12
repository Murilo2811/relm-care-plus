import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    console.log('--- TEST START ---');

    // 1. Login
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email: 'admin@relm.com',
        password: 'password123'
    });

    if (error) {
        console.error('Login Failed:', error.message);
        return;
    }
    console.log('Login Success. User ID:', user.id);

    // 2. Profile
    const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single();

    if (pError) {
        console.error('Profile Fetch Error:', pError.message);
    } else {
        console.log('Profile Found:', profile);
    }

    // 3. Claims (RLS Check)
    const { count, error: cError } = await supabase
        .from('warranty_claims')
        .select('id', { count: 'exact', head: true });

    if (cError) {
        console.error('Claims Fetch Error:', cError.message);
    } else {
        console.log('Claims Visible:', count);
    }
    console.log('--- TEST END ---');
}

run();
