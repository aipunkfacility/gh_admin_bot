
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function deepAudit() {
    const tables = ['excursions', 'accommodations', 'services', 'transport_items'];

    for (const table of tables) {
        console.log(`\n--- Deep Audit: ${table} ---`);
        const { data, error } = await supabase.from(table).select('*').limit(1);

        if (error) {
            console.error(`Error table ${table}:`, error.message);
            continue;
        }

        if (data && data[0]) {
            const keys = Object.keys(data[0]);
            console.log('Columns:', keys.join(', '));

            // Check for potential case-sensitivity issues
            const activeCols = keys.filter(k => k.toLowerCase() === 'is_active' || k.toLowerCase() === 'isactive');
            console.log('Active-related cols:', activeCols);

            const descCols = keys.filter(k => k.toLowerCase().includes('description'));
            console.log('Description-related cols:', descCols);
        } else {
            console.log('Table is empty.');
        }
    }
}

deepAudit();
