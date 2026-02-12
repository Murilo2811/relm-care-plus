import { createClient } from '@supabase/supabase-js';

// Configuração
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// --- DADOS MOCK (Extraídos de services/api.ts) ---
const mockStores = [
    {
        id: 'store-1',
        trade_name: 'Bike Point SP',
        legal_name: 'Bike Point Comércio de Bicicletas LTDA',
        cnpj: '12.345.678/0001-90',
        city: 'São Paulo',
        state: 'SP',
        contact_name: 'Carlos Gerente',
        contact_email: 'loja@bikepoint.com',
        active: true,
        claims_count: 12
    },
    {
        id: 'store-2',
        trade_name: 'Pedal Power Sul',
        legal_name: 'Pedal Power Comércio LTDA',
        cnpj: '98.765.432/0001-10',
        city: 'Curitiba',
        state: 'PR',
        contact_name: 'Ana Souza',
        contact_email: 'contato@pedalpower.com.br',
        active: true,
        claims_count: 5
    }
];

const mockUsers = [
    { id: 'u1', name: 'Admin Relm', email: 'admin@relm.com', role: 'ADMIN_RELM', active: true },
    { id: 'u2', name: 'Gerente Loja', email: 'loja@bikepoint.com', role: 'LOJA', store_id: 'store-1', active: true }
];

const mockClaims = [
    {
        id: '1',
        protocol_number: 'HB-20231025-1001',
        customer_name: 'João Silva',
        customer_phone: '11999998888',
        customer_email: 'joao@email.com',
        item_type: 'Bike',
        product_description: 'Mountain Bike XC 900',
        serial_number: 'RELM-XC9-123456',
        invoice_number: '000.123.456',
        purchase_date: '2023-01-15',
        purchase_store_name: 'Bike Point SP',
        store_id: 'store-1',
        link_status: 'LINKED_AUTO',
        status: 'EM_ANALISE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: '2',
        protocol_number: 'HB-20231026-1002',
        customer_name: 'Maria Oliveira',
        customer_phone: '21988887777',
        customer_email: 'maria@email.com',
        item_type: 'Acessório',
        product_description: 'Capacete Aero',
        serial_number: 'RELM-ACC-999',
        invoice_number: '000.987.654',
        purchase_store_name: 'Loja Desconhecida',
        link_status: 'PENDING_REVIEW',
        status: 'RECEBIDO',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
];

const mockEvents = [
    {
        id: 'e1',
        claim_id: '1',
        event_type: 'STATUS_CHANGE',
        from_status: 'RECEBIDO',
        to_status: 'EM_ANALISE',
        comment: 'Iniciando análise técnica',
        created_at: new Date().toISOString(),
        created_by_user_name: 'Técnico Relm'
    }
];

async function seedData() {
    console.log('Iniciando carga de dados (Seed)...');

    console.log('1. Inserindo Lojas...');
    const { error: errStores } = await supabase.from('stores').upsert(mockStores);
    if (errStores) console.error('  Erro Lojas:', errStores);
    else console.log('  Lojas OK');

    console.log('2. Inserindo Usuários...');
    const { error: errUsers } = await supabase.from('users').upsert(mockUsers);
    if (errUsers) console.error('  Erro Usuários:', errUsers);
    else console.log('  Usuários OK');

    console.log('3. Inserindo Solicitações (Claims)...');
    const { error: errClaims } = await supabase.from('warranty_claims').upsert(mockClaims);
    if (errClaims) console.error('  Erro Claims:', errClaims);
    else console.log('  Claims OK');

    console.log('4. Inserindo Eventos...');
    const { error: errEvents } = await supabase.from('warranty_events').upsert(mockEvents);
    if (errEvents) console.error('  Erro Eventos:', errEvents);
    else console.log('  Eventos OK');

    console.log('Concluído!');
}

seedData();
