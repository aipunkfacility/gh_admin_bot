import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function listTables() {
    // Use a query that is likely to work with Supabase/Postgres to list tables
    const { data, error } = await supabase.rpc('get_tables_info'); // If exists

    if (error) {
        console.log('RPC get_tables_info failed, trying generic query...');
        // Generic query to information_schema (requires service role usually)
        const { data: tables, error: tableError } = await supabase
            .from('pg_tables') // This might not work via PostgREST directly
            .select('tablename')
            .eq('schemaname', 'public');

        if (tableError) {
            console.log('Direct query to pg_tables failed. Trying to brute force common names...');
            const common = ['excursions', 'excursion_items', 'transport', 'transport_items', 'accommodations', 'accommodation_items', 'services', 'posts', 'rates', 'site_meta', 'excursion_categories'];
            for (const t of common) {
                const { error: e } = await supabase.from(t).select('id').limit(1);
                if (!e) console.log(`✅ Table exists: ${t}`);
                else if (e.code !== '42P01') console.log(`❓ Table ${t} error: ${e.code}`);
            }
        } else {
            console.log('Tables in public schema:');
            tables.forEach(t => console.log(`- ${t.tablename}`));
        }
    } else {
        console.log('Tables:', data);
    }
}

listTables();
