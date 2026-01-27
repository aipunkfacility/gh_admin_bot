
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });
const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(url, key);

async function inspectSchema() {
    console.log('🔍 Listing All Tables in Public Schema...');
    const { data: tables } = await admin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

    if (tables) {
        console.log('Tables:', tables.map(t => t.table_name));
    }

    console.log('\n🔍 Inspecting Sections Columns...');
    // Fetch a single row to see keys
    const { data: sections } = await admin.from('sections').select('*').limit(1);
    if (sections && sections.length) {
        console.log('Sections Row Keys:', Object.keys(sections[0]));
        console.log('Sample Row:', sections[0]);
    } else {
        console.log('Section table empty or error');
    }

    console.log('\n🔍 Inspecting Excursions Columns...');
    const { data: exc } = await admin.from('excursions').select('*').limit(1);
    if (exc && exc.length) {
        console.log('Excursions Row Keys:', Object.keys(exc[0]));
    } else {
        console.log('Excursions table empty or error (but table exists if we got here)');
        // if empty, we can't see keys via select *. Limit 1 returns empty array.
        // We need to fetch metadata or insert a dummy to see error?
        // Actually, if we select *, we get keys even if empty? No, Supabase returns empty array.
        // Fallback: Use error message from seed as truth? "Could not find 'category_id'".
        // It implies the column is NOT 'category_id'.
        // Let's try to select 'categoryId' specifically to see if it works?
        // Or just select count?
    }

    // Better: Query information_schema for columns
    console.log('\n🔍 querying information_schema for excursions columns...');
    const { data: cols } = await admin
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'excursions');
    if (cols) console.log('Excursions Columns:', cols.map(c => c.column_name));

    console.log('\n🔍 Inspecting Transport Items Columns...');
    const { data: trans } = await admin.from('transport_items').select('*').limit(1);
    if (trans && trans.length) {
        console.log('Transport Items Row Keys:', Object.keys(trans[0]));
    } else {
        console.log('Transport Items table empty or error. Trying "transport"...');
        const { data: t2 } = await admin.from('transport').select('*').limit(1);
        if (t2 && t2.length) console.log('Transport Row Keys:', Object.keys(t2[0]));

        // Query info schema
        const { data: cols } = await admin
            .from('information_schema.columns')
            .select('column_name')
            .eq('table_name', 'transport_items');
        if (cols) console.log('Transport Items Schema Cols:', cols.map(c => c.column_name));
    }
}

inspectSchema();
