import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkData() {
    console.log('\n🔎 Checking Excursion Categories...');
    const { data: excCats, error: excErr } = await supabase.from('excursion_categories').select('*');
    if (excErr) console.log('❌ Error:', excErr.message);
    else {
        console.log(`✅ Found ${excCats.length} categories:`);
        excCats.forEach(c => console.log(`   ID: ${c.id}, Title: ${c.title}, Slug: ${c.slug}`));
    }

    console.log('\n🔎 Checking Services...');
    const { data: services, error: srvErr } = await supabase.from('services').select('*');
    if (srvErr) console.log('❌ Error:', srvErr.message);
    else {
        console.log(`✅ Found ${services.length} services:`);
        services.forEach(s => console.log(JSON.stringify(s)));
    }
}

await checkData();
