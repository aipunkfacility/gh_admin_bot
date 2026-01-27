
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const expectedTables = [
    'posts',
    'transport_items',
    'excursions',
    'accommodations',
    'services',
    'site_meta',
    'sections',
    'transport_categories',
    'excursion_categories',
    'rates'
];

async function checkTables() {
    console.log('Checking tables...');
    const missingTables: string[] = [];
    const existingTables: string[] = [];

    for (const table of expectedTables) {
        // Try to select 0 rows just to check existence
        const { error } = await supabaseAdmin.from(table).select('*').limit(0);
        if (error && error.code === '42P01') {
            missingTables.push(table);
            console.log(`❌ Table '${table}' DOES NOT EXIST.`);
        } else if (error) {
            console.error(`Error checking '${table}':`, error.message);
        } else {
            existingTables.push(table);
            console.log(`✅ Table '${table}' exists.`);
        }
    }

    // Check column tgText in excursions as sample
    if (existingTables.includes('excursions')) {
        const { data, error } = await supabaseAdmin.from('excursions').select('tgText').limit(0);
        if (error) {
            console.log(`⚠️ Column 'tgText' missing in 'excursions' (or other error: ${error.message})`);
        } else {
            console.log(`✅ Column 'tgText' exists in 'excursions'.`);
        }
    }

    console.log('\nSummary:');
    console.log(`Missing: ${missingTables.length}`);
    console.log(`Existing: ${existingTables.length}`);

    if (missingTables.length > 0) {
        console.log('You need to run migrations to create tables.');
        process.exit(1); // Signal that we are not fully ready
    }
}

checkTables();
