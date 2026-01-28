
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const TABLES = ['excursions', 'accommodations', 'services', 'transport_items'];

async function audit() {
    for (const table of TABLES) {
        console.log(`\n=== AUDIT: ${table} ===`);
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
            console.error(error);
            continue;
        }

        if (!data || data.length === 0) {
            console.log('Table is empty.');
            continue;
        }

        const totalRows = data.length;
        const keys = Object.keys(data[0]);
        const stats = {};

        keys.forEach(key => {
            const populated = data.filter(row => row[key] !== null && row[key] !== undefined && row[key] !== '').length;
            stats[key] = {
                count: populated,
                percent: Math.round((populated / totalRows) * 100) + '%'
            };
        });

        console.table(stats);

        // Find pairs
        const pairs = [
            ['is_active', 'isActive'],
            ['is_popular', 'isPopular'],
            ['short_description', 'shortDescription'],
            ['price_from', 'priceFrom'],
            ['tg_image', 'tgImage'],
            ['category_id', 'categoryId'],
            ['use_cases', 'useCases'],
            ['territory_description', 'territoryDescription'],
            ['room_features', 'roomFeatures']
        ];

        console.log('--- Case Redundancy Check ---');
        pairs.forEach(([oldKey, newKey]) => {
            if (keys.includes(oldKey) && keys.includes(newKey)) {
                const bothPopulated = data.filter(row =>
                    (row[oldKey] !== null && row[oldKey] !== undefined && row[oldKey] !== '') &&
                    (row[newKey] !== null && row[newKey] !== undefined && row[newKey] !== '')
                ).length;
                console.log(`${oldKey} vs ${newKey}: ${bothPopulated} rows have BOTH populated.`);
            }
        });
    }
}

audit();
