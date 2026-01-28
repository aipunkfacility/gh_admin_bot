import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkItem() {
    console.log(`\n🔎 Searching for Ford Ranger...`);
    // Removed .single() to handle multiple results
    const { data, error } = await supabase
        .from('transport_items')
        .select('*')
        .ilike('title', '%Ford Ranger%');

    if (error) {
        console.log(`❌ Error: ${error.message}`);
    } else {
        console.log(`✅ Found: ${data.length} items`);
        if (data.length > 0) {
            console.log('📋 First Item Data:');
            console.log(JSON.stringify(data[0], null, 2));
        } else {
            // Fallback: list all titles
            const { data: all } = await supabase.from('transport_items').select('title').limit(10);
            console.log('Available titles:', all);
        }
    }
}

await checkItem();
