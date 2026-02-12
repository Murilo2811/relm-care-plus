-- Create Enums
CREATE TYPE app_role AS ENUM ('ADMIN_RELM', 'GERENTE_RELM', 'LOJA');
CREATE TYPE claim_status AS ENUM ('RECEBIDO', 'EM_ANALISE', 'AGUARDANDO_CLIENTE', 'AGUARDANDO_LOJA', 'APROVADO', 'REPROVADO', 'FINALIZADO', 'CANCELADO');
CREATE TYPE link_status AS ENUM ('PENDING_REVIEW', 'LINKED_AUTO', 'LINKED_MANUALLY');

-- Create Stores Table
CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY,
    trade_name TEXT NOT NULL,
    legal_name TEXT NOT NULL,
    cnpj TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    claims_count INTEGER DEFAULT 0
);

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role app_role NOT NULL,
    store_id TEXT REFERENCES stores(id),
    active BOOLEAN DEFAULT true
);

-- Create Warranty Claims Table
CREATE TABLE IF NOT EXISTS warranty_claims (
    id TEXT PRIMARY KEY,
    protocol_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    item_type TEXT NOT NULL,
    product_description TEXT NOT NULL,
    serial_number TEXT NOT NULL,
    invoice_number TEXT NOT NULL,
    purchase_date DATE,
    purchase_store_name TEXT NOT NULL,
    store_id TEXT REFERENCES stores(id),
    link_status link_status NOT NULL,
    status claim_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Warranty Events Table
CREATE TABLE IF NOT EXISTS warranty_events (
    id TEXT PRIMARY KEY,
    claim_id TEXT REFERENCES warranty_claims(id) NOT NULL,
    event_type TEXT NOT NULL,
    from_status claim_status,
    to_status claim_status,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_name TEXT NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_events ENABLE ROW LEVEL SECURITY;

-- Create basic policies (Allow all for now as per plan, can be restricted later)
CREATE POLICY "Allow all operations for now" ON stores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for now" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for now" ON warranty_claims FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for now" ON warranty_events FOR ALL USING (true) WITH CHECK (true);
