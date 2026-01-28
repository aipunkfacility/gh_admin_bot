import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // NEED SERVICE ROLE FOR UPDATES
);

async function migrate() {
    console.log('🚀 Starting ID Migration...');

    // 1. Fetch Categories
    const { data: exCats } = await supabase.from('excursion_categories').select('*');
    const { data: trCats } = await supabase.from('transport_categories').select('*');

    const slugToId = {};
    [...(exCats || []), ...(trCats || [])].forEach(c => {
        slugToId[c.slug] = c.id;
    });

    // Manual fixes for old short slugs
    const manualMap = {
        'nature': slugToId['nature-adventure'],
        'history': slugToId['history-city'],
        'islands': slugToId['islands-parks'],
        'moto': slugToId['moto'],
        'car': slugToId['car'],
        'standard': slugToId['standard'],
        'comfort': slugToId['comfort'],
        'maxi': slugToId['maxi']
    };

    console.log('Mapping table:', manualMap);

    // 2. Update Excursions
    const { data: excursions } = await supabase.from('excursions').select('id, title, categoryId');
    for (const item of (excursions || [])) {
        const targetId = manualMap[item.categoryId] || slugToId[item.categoryId];
        if (targetId && targetId !== item.categoryId) {
            console.log(`Updating Excursion [${item.title}]: ${item.categoryId} -> ${targetId}`);
            await supabase.from('excursions').update({ categoryId: targetId }).eq('id', item.id);
        }
    }

    // 3. Update Transport Items
    const { data: transport } = await supabase.from('transport_items').select('id, title, categoryId');
    for (const item of (transport || [])) {
        const targetId = manualMap[item.categoryId] || slugToId[item.categoryId];
        if (targetId && targetId !== item.categoryId) {
            console.log(`Updating Transport [${item.title}]: ${item.categoryId} -> ${targetId}`);
            await supabase.from('transport_items').update({ categoryId: targetId }).eq('id', item.id);
        }
    }

    console.log('✅ Migration Finished!');
}

migrate();
