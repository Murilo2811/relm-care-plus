const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'tgfcwkfolmyaawscfovu';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';

async function runMigration() {
    const sqlPath = path.join(__dirname, '../supabase/migrations/20240212_initial_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executando migração via Management API...');

    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify({ query: sql })
    });

    if (response.ok) {
        console.log('Migração de Esquema: SUCESSO');
    } else {
        console.error('Migração de Esquema: FALHA');
        console.error(await response.text());
        process.exit(1);
    }
}

runMigration();
