
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyData() {
    console.log('🕵️‍♀️ Verifying Data Integrity...');

    // 1. Check Categories
    const { data: cats, error: err1 } = await supabaseAdmin.from('excursion_categories').select('*');
    if (err1) console.error(err1);
    else {
        console.log(`✅ Excursion Categories: ${cats.length}`);
        cats.forEach(c => console.log(`   - ID: ${c.id} | Slug: ${c.slug} | Title: ${c.title}`));
    }

    // 2. Check Items
    const { data: items, error: err2 } = await supabaseAdmin.from('excursions').select('id, slug, "categoryId"').limit(5);
    if (err2) console.error(err2);
    else {
        console.log(`✅ Excursions Sample:`);
        items.forEach(i => console.log(`   - Slug: ${i.slug} | CategoryId: ${i.categoryId}`));
    }

    // 3. Check Rates
    const { data: rates } = await supabaseAdmin.from('rates').select('*');
    console.log(`✅ Rates: ${rates?.length}`);
}

verifyData();
