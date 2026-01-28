import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    console.log('\n🔎 Checking Excursion Schema (Raw)...');
    const { data, error } = await supabase
        .from('excursions')
        .select('*')
        .limit(1);

    if (error) console.log('❌ Error:', error.message);
    else if (data.length > 0) {
        console.log('✅ Keys found:', Object.keys(data[0]).join(', '));
    } else {
        console.log('⚠️ No excursions found.');
    }
}

await checkSchema();
