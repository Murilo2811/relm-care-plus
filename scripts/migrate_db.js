import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

// Reconstruct __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Projeto
const DB_HOST = 'db.tgfcwkfolmyaawscfovu.supabase.co';
const DB_PORT = 5432;
const DB_USER = 'postgres';
const DB_NAME = 'postgres';
const DB_PASS = process.env.DB_PASS || '';

// URL Encoded Password for Connection String (handling special chars like @)
const encodedPass = encodeURIComponent(DB_PASS);
const connectionString = `postgresql://${DB_USER}:${encodedPass}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase external connections
});

async function runMigration() {
    try {
        console.log('Conectando ao banco de dados...');
        await client.connect();
        console.log('Conectado!');

        const sqlPath = path.join(__dirname, '../supabase/migrations/20240212_harden_rls.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executando script de HARDENING (Segurança)...');
        await client.query(sql);
        console.log('✅ Migração concluída com sucesso! As tabelas foram criadas.');

    } catch (err) {
        console.error('❌ Erro durante a migração:', err.message);
    } finally {
        await client.end();
    }
}

runMigration();
