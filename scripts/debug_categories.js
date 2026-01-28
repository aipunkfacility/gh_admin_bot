import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkCategories() {
    console.log(`\n🔎 Checking transport_categories...`);
    const { data, error } = await supabase
        .from('transport_categories')
        .select('*');

    if (error) {
        console.log(`❌ Error: ${error.message} (Maybe table does not exist?)`);
    } else {
        console.log(`✅ Found ${data.length} categories:`);
        data.forEach(c => {
            console.log(`   - ID: "${c.id}" | Title: "${c.title}" | Active: ${c.is_active ?? c.isActive}`);
        });
    }
}

await checkCategories();
