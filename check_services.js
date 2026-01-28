
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { readJsonFile } from './src/lib/bot/utils.js';

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('--- Checking Services ---');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Missing');
console.log('USE_SUPABASE:', process.env.USE_SUPABASE);

try {
    const services = await readJsonFile('services.json');
    console.log(`Loaded ${services.length} services.`);

    services.forEach(s => {
        console.log(`ID: ${s.id}, Title: ${s.title}, Active: ${s.isActive}, Slug: ${s.slug}`);
    });

    const visa = services.find(s => s.id === 'visa-run-cambodia');
    const transfer = services.find(s => s.id === 'transfer-airport-muine');

    if (!visa) console.error('❌ Visa Run MISSING');
    else console.log('✅ Visa Run Found');

    if (!transfer) console.error('❌ Transfer MISSING');
    else console.log('✅ Transfer Found');

} catch (e) {
    console.error('Error:', e);
}
