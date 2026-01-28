import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function checkData() {
    console.log('🔍 Checking Categories...');
    const { data: cats, error: catErr } = await supabase.from('excursion_categories').select('id, slug, title');
    if (catErr) console.error('Cat Error:', catErr);
    else console.log('Categories:', cats);

    console.log('\n🔍 Checking Excursions (first 5)...');
    const { data: items, error: itemErr } = await supabase.from('excursions').select('id, title, categoryId').limit(5);
    if (itemErr) console.error('Item Error:', itemErr);
    else {
        items.forEach(i => {
            const match = cats?.find(c => c.id === i.categoryId);
            console.log(`Item: ${i.title}, CategoryId: ${i.categoryId}, Match: ${match ? match.title : '❌ NO MATCH'}`);
        });
    }
}

checkData();
