import { createClient } from '@supabase/supabase-js';

import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need to ensure this is set or passed

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Env Vars: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const usersToCreate = [
    { email: 'admin@relm.com', password: 'password123', role: 'ADMIN_RELM', name: 'Admin Relm' },
    { email: 'loja@bikepoint.com', password: 'password123', role: 'LOJA', name: 'Gerente Loja', store_id: 'store-1' }
];

async function seedAuth() {
    console.log('🔐 Iniciando Seed de Autenticação...');

    // 1. Limpar tabela pública de usuários (pois vamos recriar com IDs do Auth)
    console.log('   -> Limpando tabela public.users antiga...');
    const { error: deleteError } = await supabase.from('users').delete().neq('id', '0'); // Delete all
    if (deleteError) console.error('Erro ao limpar users:', deleteError.message);

    for (const u of usersToCreate) {
        console.log(`\n👤 Processando usuário: ${u.email}`);

        // 2. Criar usuário no Supabase Auth
        // Nota: admin.createUser auto-confirma o email
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: u.email,
            password: u.password,
            email_confirm: true
        });

        let userId = authUser?.user?.id;

        if (authError) {
            console.log(`   ⚠️ Erro Auth: ${authError.message}`);
            // Tentar buscar se já existe
            if (authError.message.includes('already been registered')) {
                const { data: existingUser } = await supabase.auth.admin.listUsers();
                const found = existingUser.users.find(x => x.email === u.email);
                if (found) {
                    userId = found.id;
                    console.log(`   -> Usuário existente encontrado: ${userId}`);
                }
            }
        } else {
            console.log(`   ✅ Usuário Auth criado: ${userId}`);
        }

        if (userId) {
            // 3. Inserir na tabela pública 'profiles' vinculando o ID
            const { error: publicError } = await supabase.from('profiles').upsert({
                id: userId, // VINCULO CRÍTICO: ID da tabela pública = ID do Auth
                email: u.email,
                name: u.name,
                role: u.role,
                store_id: u.store_id || null,
                active: true
            });

            if (publicError) {
                console.error(`   ❌ Erro ao criar perfil público: ${publicError.message}`);
            } else {
                console.log(`   ✅ Perfil público vinculado com sucesso.`);
            }
        }
    }
}

seedAuth();
