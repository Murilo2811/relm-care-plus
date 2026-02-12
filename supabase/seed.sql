-- Seed Stores
INSERT INTO stores (id, trade_name, legal_name, cnpj, city, state, contact_name, contact_email, active, claims_count) VALUES
('store-1', 'Bike Point SP', 'Bike Point Comércio de Bicicletas LTDA', '12.345.678/0001-90', 'São Paulo', 'SP', 'Carlos Gerente', 'loja@bikepoint.com', true, 12),
('store-2', 'Pedal Power Sul', 'Pedal Power Comércio LTDA', '98.765.432/0001-10', 'Curitiba', 'PR', 'Ana Souza', 'contato@pedalpower.com.br', true, 5)
ON CONFLICT (id) DO NOTHING;

-- Seed Users
INSERT INTO users (id, name, email, role, store_id, active) VALUES
('u1', 'Admin Relm', 'admin@relm.com', 'ADMIN_RELM', NULL, true),
('u2', 'Gerente Loja', 'loja@bikepoint.com', 'LOJA', 'store-1', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Claims
INSERT INTO warranty_claims (id, protocol_number, customer_name, customer_phone, customer_email, item_type, product_description, serial_number, invoice_number, purchase_date, purchase_store_name, store_id, link_status, status, created_at, updated_at) VALUES
('1', 'HB-20231025-1001', 'João Silva', '11999998888', 'joao@email.com', 'Bike', 'Mountain Bike XC 900', 'RELM-XC9-123456', '000.123.456', '2023-01-15', 'Bike Point SP', 'store-1', 'LINKED_AUTO', 'EM_ANALISE', NOW(), NOW()),
('2', 'HB-20231026-1002', 'Maria Oliveira', '21988887777', 'maria@email.com', 'Acessório', 'Capacete Aero', 'RELM-ACC-999', '000.987.654', NULL, 'Loja Desconhecida', NULL, 'PENDING_REVIEW', 'RECEBIDO', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed Events
INSERT INTO warranty_events (id, claim_id, event_type, from_status, to_status, comment, created_at, created_by_user_name) VALUES
('e1', '1', 'STATUS_CHANGE', 'RECEBIDO', 'EM_ANALISE', 'Iniciando análise técnica', NOW(), 'Técnico Relm')
ON CONFLICT (id) DO NOTHING;
