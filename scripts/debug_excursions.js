import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkExcursions() {
    console.log('\n🔎 Checking Excursions...');
    const { data, error } = await supabase
        .from('excursions')
        .select('id, title, category_id, slug, is_active')
        .limit(5);

    if (error) console.log('❌ Error:', error.message);
    else {
        console.log(`✅ Found ${data.length} items. Sample:`);
        data.forEach(item => {
            console.log(`   - Title: ${item.title}`);
            console.log(`     CatID: ${item.category_id}`);
            console.log(`     Active: ${item.is_active}`);
        });
    }
}

await checkExcursions();
