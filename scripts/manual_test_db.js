import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { readJsonFile } from '../src/lib/bot/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// .env is in project root
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

console.log('--- DB TEST START ---');
console.log('Checking USE_SUPABASE:', process.env.USE_SUPABASE);
console.log('Checking Service Key present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

try {
    console.log('Attempting to read transport-items.json...');
    const data = await readJsonFile('transport-items.json');

    if (Array.isArray(data)) {
        console.log(`✅ Success! Received ${data.length} items.`);
        if (data.length > 0) {
            console.log('First item title:', data[0].title);
            console.log('First item source (id/slug):', data[0].id);
        }
    } else {
        console.log('❓ Received non-array data:', typeof data);
    }
} catch (e) {
    console.error('❌ Error during read:', e);
}
console.log('--- DB TEST END ---');
