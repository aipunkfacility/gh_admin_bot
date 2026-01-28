import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

const testMapping = [
    { collection: 'excursion-items', expected: 'excursions' },
    { collection: 'accommodation-items', expected: 'accommodations' },
    { collection: 'transport-items', expected: 'transport_items' },
    { collection: 'site-meta', expected: 'site_meta' }
];

async function verify() {
    console.log('🧪 Verifying Supabase Table Mapping...');

    for (const item of testMapping) {
        // Simulate getTableName logic
        let tableName = item.collection;
        const mapping = {
            'excursion-items': 'excursions',
            'accommodation-items': 'accommodations',
            'transport-items': 'transport_items'
        };
        tableName = mapping[tableName] || tableName.replace(/-/g, '_');

        const { count, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`❌ Table [${tableName}] (from ${item.collection}): ${error.message}`);
        } else {
            console.log(`✅ Table [${tableName}] (from ${item.collection}): OK (Count: ${count})`);
        }
    }
}

verify();
