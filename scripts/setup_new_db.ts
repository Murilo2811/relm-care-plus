import { createClient } from '@supabase/supabase-js';

// Credentials from User
const SUPABASE_URL = 'https://tgfcwkfolmyaawscfovu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmN3a2ZvbG15YWF3c2Nmb3Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDg4OTI1MywiZXhwIjoyMDg2NDY1MjUzfQ.Ta4Id8fE9n2tK6LLsBSWC6ZzKzBSggKDYO8xkTl4B_w';

if (!SERVICE_ROLE_KEY) {
    console.error('Missing SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function run() {
    console.log('--- Starting Database Setup ---');

    // 1. Verify Connection
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
        console.error('Connection Failed:', userError);
        return;
    }
    console.log('Connection OK. Current users:', users.users.length);

    // 2. Check Tables (Using simple select)
    const { error: claimsError } = await supabase.from('warranty_claims').select('count', { count: 'exact', head: true });

    if (claimsError && claimsError.code) {
        console.log('Error checking warranty_claims (likely missing):', claimsError.message);
        console.log('CRITICAL: Cannot run DDL via JS client directly. Manual SQL execution needed via Dashboard or psql.');
    } else {
        console.log('Table warranty_claims exists.');

        // Check item_type column by trying to select it
        const { error: colError } = await supabase.from('warranty_claims').select('item_type').limit(1);
        if (colError) {
            console.log('Column item_type missing or error:', colError.message);
        } else {
            console.log('Column item_type exists.');
        }
    }

    // 3. Create Admin User
    const adminEmail = 'admin@relmcare.com';
    const adminPass = 'Admin@Relm2024';

    // Check auth users first
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    let foundAuth = authUsers.users.find(u => u.email === adminEmail);
    let adminUserId = foundAuth?.id;

    if (foundAuth) {
        console.log('Admin Auth User exists, ID:', foundAuth.id);
    } else {
        console.log('Creating Admin Auth User...');
        const { data: newAuth, error: createError } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPass,
            email_confirm: true,
            user_metadata: { name: 'Administrador Relm' }
        });

        if (createError) {
            console.error('Error creating admin:', createError);
            // if error is "email already registered", find it
            if (createError.message.includes('already registered')) {
                // try finding again?
            }
        } else {
            console.log('Admin created:', newAuth.user.id);
            adminUserId = newAuth.user.id;
        }
    }

    // 4. Ensure Profile exists and has role
    if (adminUserId) {
        console.log('Syncing Admin Profile...', adminUserId);
        const { error: upsertError } = await supabase.from('profiles').upsert({
            id: adminUserId,
            // email: adminEmail, // profiles table might not have email depending on schema
            full_name: 'Administrador Relm',
            role: 'admin_relm',
            is_active: true
        });

        if (upsertError) {
            console.error('Error upserting profile:', upsertError);
            console.log('If error involves "new row violates row-level security policy", we are using service role so it should bypass. Check constraints.');
        }
        else console.log('Admin Profile synced.');
    }
}

run();
