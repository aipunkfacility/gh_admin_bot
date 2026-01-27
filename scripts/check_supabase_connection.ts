
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
    console.log('Checking Supabase connection...');
    try {
        // Try to catch connection errors even if table doesn't exist
        const { data, error } = await supabaseAdmin.from('site_meta').select('count', { count: 'exact', head: true });

        if (error) {
            // If standard Postgres error (relation does not exist), connection is good!
            if (error.code === '42P01') { // undefined_table
                console.log('✅ Connection successful! (Table "site_meta" does not exist yet, which is expected)');
                process.exit(0);
            }
            console.error('❌ Connection failed:', error.message, error.code);
            process.exit(1);
        }
        console.log('✅ Connection successful! Table "site_meta" exists.');
    } catch (err) {
        console.error('❌ Unexpected error:', err);
        process.exit(1);
    }
}

checkConnection();
