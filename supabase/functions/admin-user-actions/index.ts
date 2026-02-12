import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Verify Caller is Authenticated matches generic user
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) throw new Error('Unauthorized')

        // 2. Initialize Admin Client (Service Role) for Privileged Operations
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 3. Verify Caller is actually an ADMIN in our public schema
        const { data: adminProfile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!adminProfile || adminProfile.role !== 'ADMIN_RELM') {
            throw new Error('Forbidden: Only admins can perform this action')
        }

        const { action, userData, userId } = await req.json()

        // 4. Handle Actions
        if (action === 'create') {
            console.log(`Creating user: ${userData.email}`)
            // A. Create in Supabase Auth
            const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: userData.email,
                password: userData.password,
                email_confirm: true,
                user_metadata: { name: userData.name }
            })

            if (authError) throw authError

            // B. Create in Public Users Table
            const { error: dbError } = await supabaseAdmin.from('profiles').insert({
                id: authUser.user.id,
                full_name: userData.name,
                role: userData.role,
                store_id: userData.storeId || null,
                is_active: userData.active ?? true
            })

            if (dbError) {
                // Rollback: Delete Auth user if DB insert fails to maintain consistency
                await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
                throw new Error(`Database insert failed: ${dbError.message}`)
            }

            return new Response(JSON.stringify({ success: true, user: authUser.user }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        if (action === 'update') {
            console.log(`Updating user: ${userId}`)
            if (!userId) throw new Error('userId is required for update')

            // A. Update Auth (if password or email provided)
            const authUpdates: any = {}
            if (userData.email) authUpdates.email = userData.email
            if (userData.password) authUpdates.password = userData.password
            if (userData.name) authUpdates.user_metadata = { name: userData.name }

            if (Object.keys(authUpdates).length > 0) {
                const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
                    userId,
                    authUpdates
                )
                if (authError) throw authError
            }

            // B. Update Public Table
            const publicUpdates: any = {}
            if (userData.name) publicUpdates.full_name = userData.name
            // if (userData.email) publicUpdates.email = userData.email // Email not in profiles
            if (userData.role) publicUpdates.role = userData.role
            if (userData.storeId !== undefined) publicUpdates.store_id = userData.storeId || null
            if (userData.active !== undefined) publicUpdates.is_active = userData.active

            if (Object.keys(publicUpdates).length > 0) {
                const { error: dbError } = await supabaseAdmin
                    .from('profiles')
                    .update(publicUpdates)
                    .eq('id', userId)

                if (dbError) throw dbError
            }

            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        if (action === 'delete') {
            if (!userId) throw new Error('userId is required for delete')

            // Delete from Auth (Cascade should ideally handle public, but we do explicitly)
            const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
            if (authError) throw authError

            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        throw new Error(`Unknown action: ${action}`)

    } catch (error) {
        console.error('Error in admin-user-actions:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
