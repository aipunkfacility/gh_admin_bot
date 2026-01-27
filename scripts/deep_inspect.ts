
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const tablesToCheck = [
    'transport_categories',
    'excursion_categories',
    'transport_items',
    'excursions',
    'posts',
    'site_meta',
    'rates',
    'sections' // Added sections
];

async function deepInspect() {
    console.log('🕵️‍♀️ Starting Deep Database Inspection...');
    console.log(`URL: ${process.env.SUPABASE_URL}`);

    for (const table of tablesToCheck) {
        console.log(`\n--- TABLE: ${table} ---`);

        // 1. Check Count
        const { count, error: countError } = await supabaseAdmin.from(table).select('*', { count: 'exact', head: true });
        if (countError) {
            console.log(`❌ Error accessing table: ${countError.message} (${countError.code})`);
            if (countError.code === '42P01') console.log('   (Table does not exist)');
            continue;
        }
        console.log(`📊 Rows: ${count}`);

        if (count === 0) {
            console.log('   (Table is empty)');
            continue;
        }

        // 2. Sample Data
        const { data, error: dataError } = await supabaseAdmin.from(table).select('*').limit(3);
        if (dataError) {
            console.log(`❌ Error reading sample: ${dataError.message}`);
            continue;
        }

        if (data && data.length > 0) {
            console.log('📋 Sample Row (Keys):', Object.keys(data[0]).join(', '));
            // Show ID and Slug specifically
            data.forEach((row, i) => {
                console.log(`   Row ${i + 1}: id="${row.id}" slug="${row.slug || 'N/A'}" title="${row.title?.substring(0, 20)}..."`);
            });
        }
    }
}

deepInspect();
