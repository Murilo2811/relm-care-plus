const fetch = require('node-fetch');

const PROJECT_REF = 'tgfcwkfolmyaawscfovu';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || ''; // Set via Env Var
const QUERY = 'SELECT now();';

async function testSqlAccess() {
    console.log(`Testing SQL access for project ${PROJECT_REF}...`);

    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify({ query: QUERY })
    });

    if (response.ok) {
        const data = await response.json();
        console.log('Success! SQL Output:', data);
        return true;
    } else {
        console.error('Failed to execute SQL.');
        console.error(`Status: ${response.status} ${response.statusText}`);
        const err = await response.text();
        console.error('Response:', err);
        return false;
    }
}

testSqlAccess();
