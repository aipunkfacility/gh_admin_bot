
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fullAudit() {
    const tables = ['excursions', 'accommodations', 'services', 'transport_items'];

    for (const table of tables) {
        console.log(`\n=== Table: ${table} ===`);
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.error(error.message);
            continue;
        }
        if (!data || data.length === 0) continue;

        const keys = Object.keys(data[0]);
        const snakeKeys = keys.filter(k => k.includes('_'));
        const camelKeys = keys.filter(k => k !== k.toLowerCase() && !k.includes('_'));

        console.log('Snake Case Columns:', snakeKeys);
        console.log('Camel Case Columns:', camelKeys);

        // Find matches
        snakeKeys.forEach(sk => {
            const camelVersion = sk.split('_').map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join('');
            if (keys.includes(camelVersion)) {
                console.log(`MATCH FOUND: ${sk} -> ${camelVersion}`);
            }
        });
    }
}

fullAudit();
