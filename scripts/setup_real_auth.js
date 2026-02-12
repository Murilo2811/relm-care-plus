import { createClient } from '@supabase/supabase-js';

// Configuração hardcoded (Service Key para Admin API)
const supabaseUrl = 'https://tgfcwkfolmyaawscfovu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmN3a2ZvbG15YWF3c2Nmb3Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDg4OTI1MywiZXhwIjoyMDg2NDY1MjUzfQ.Ta4Id8fE9n2tK6LLsBSWC6ZzKzBSggKDYO8xkTl4B_w';

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
            // 3. Inserir na tabela pública 'users' vinculando o ID
            const { error: publicError } = await supabase.from('users').upsert({
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
