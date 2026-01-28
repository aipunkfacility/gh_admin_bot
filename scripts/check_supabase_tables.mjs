import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('❌ SUPABASE_URL or KEY is missing in .env');
    process.exit(1);
}

const supabase = createClient(url, key);

const tables = [
    'excursions',
    'excursion_categories',
    'transport',
    'accommodations',
    'rates',
    'site_meta',
    'posts',
    'services'
];

async function checkTables() {
    console.log('🔌 Checking Supabase tables...');
    for (const table of tables) {
        const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`❌ Table [${table}]: ${error.message} (${error.code})`);
        } else {
            console.log(`✅ Table [${table}]: Found (${count} items)`);
        }
    }
}

checkTables();
