import { spawn } from 'child_process';

const ENV_VARS = {
    VITE_SUPABASE_URL: 'https://tgfcwkfolmyaawscfovu.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmN3a2ZvbG15YWF3c2Nmb3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4ODkyNTMsImV4cCI6MjA4NjQ2NTI1M30.4EQoP4oCHmwVDzuHWnHlHZaRDvNtKuP2SsGRZaIh974'
};

async function setEnv(key, value) {
    return new Promise((resolve, reject) => {
        console.log(`Setting ${key}...`);

        // First remove existing
        const rm = spawn('npx', ['vercel', 'env', 'rm', key, 'production', '--yes'], { shell: true, stdio: 'inherit' });

        rm.on('close', () => {
            // Then add new
            const add = spawn('npx', ['vercel', 'env', 'add', key, 'production'], { shell: true });

            // Write value to stdin exactly without newlines
            add.stdin.write(value);
            add.stdin.end();

            add.stdout.on('data', (d) => process.stdout.write(d));
            add.stderr.on('data', (d) => process.stderr.write(d));

            add.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Failed to set ${key}`));
            });
        });
    });
}

async function run() {
    try {
        await setEnv('VITE_SUPABASE_URL', ENV_VARS.VITE_SUPABASE_URL);
        await setEnv('VITE_SUPABASE_ANON_KEY', ENV_VARS.VITE_SUPABASE_ANON_KEY);
        console.log('Done!');
    } catch (e) {
        console.error(e);
    }
}

run();
