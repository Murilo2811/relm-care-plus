import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    console.log('--- FORCING STORE ID UPDATE ---');

    // 1. Login as Admin
    console.log('1. Logging in as Admin...');
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email: 'admin@relm.com',
        password: 'password123'
    });

    if (error) {
        console.error('❌ Admin Login Failed:', error.message);
        return;
    }
    console.log('✅ Admin Logged In.');

    // 2. Find Store User
    console.log('2. Finding Store User Profile...');
    // We need to find the user ID for 'loja@bikepoint.com'
    // Since we can't query auth.users, let's try to find them in 'profiles' by email (if email column exists?)
    // Wait, earlier I noted email is NOT in profiles table (removed in admin-user-actions).
    // BUT we know the store user ID from previous logs: 'ff102911-b7f1-4139-ac6b-663...' (Wait, need exact ID).
    // Better strategy: Login as Store User to get ID, then Login as Admin to update.

    // 2a. Login as Store to get ID
    const { data: { user: storeUser }, error: storeLoginError } = await supabase.auth.signInWithPassword({
        email: 'loja@bikepoint.com',
        password: 'password123'
    });

    if (storeLoginError) {
        console.error('❌ Store Login Failed:', storeLoginError.message);
        return;
    }
    const storeUserId = storeUser.id;
    console.log(`✅ Identified Store User ID: ${storeUserId}`);

    // 2b. Re-login as Admin (to having write permissions)
    await supabase.auth.signInWithPassword({
        email: 'admin@relm.com',
        password: 'password123'
    });

    // 3. Update Profile
    console.log(`3. Updating Profile for ${storeUserId} to store-1...`);
    const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ store_id: 'store-1' })
        .eq('id', storeUserId)
        .select();

    if (updateError) {
        console.error('❌ Update Failed:', updateError.message);
    } else {
        console.log('✅ Update Success:', data);
    }
    console.log('--- END ---');
}

run();
