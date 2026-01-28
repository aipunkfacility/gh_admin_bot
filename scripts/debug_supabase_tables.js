import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

async function checkTable(tableName) {
    console.log(`\n🔎 Checking table: [${tableName}]`);
    const { count, error } = await supabase.from(tableName).select('*', { count: 'exact', head: true });

    if (error) {
        console.log(`❌ Error: ${error.message} (Code: ${error.code})`);
    } else {
        console.log(`✅ Count: ${count}`);

        // Fetch specific columns to identify
        const { data } = await supabase.from(tableName).select('id, title, is_active, active').limit(20);
        if (data && data.length > 0) {
            console.log('📋 First 5 IDs found:');
            data.slice(0, 5).forEach(i => console.log(`   - ${i.id} (Active: ${i.is_active ?? i.active ?? '?'}) "${i.title}"`));
        }
    }
}

console.log(`🔌 Connected to: ${process.env.SUPABASE_URL}`);
await checkTable('transport_items');
await checkTable('transport'); 
