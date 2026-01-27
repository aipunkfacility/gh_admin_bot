
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAPPING = {
    'nature': 'nature-adventure',
    'history': 'history-city',
    'islands': 'islands-parks'
};

async function fixRelations() {
    console.log('🔧 Fixing Relations for Excursions...');

    // 1. Get Category UUIDs
    const catMap = new Map<string, string>();
    const { data: cats, error } = await supabaseAdmin.from('excursion_categories').select('id, slug');

    if (error || !cats) {
        console.error('❌ Failed to load categories:', error);
        return;
    }

    cats.forEach(c => catMap.set(c.slug, c.id));
    console.log('🗺️  Category Map (Slug -> UUID):', Object.fromEntries(catMap));

    // 2. Update Items
    for (const [legacyId, slug] of Object.entries(MAPPING)) {
        const uuid = catMap.get(slug);
        if (!uuid) {
            console.error(`❌ UUID not found for slug: ${slug}`);
            continue;
        }

        console.log(`Checking items with categoryId="${legacyId}" -> replacing with "${uuid}"...`);

        const { data: itemsToUpdate, error: fetchErr } = await supabaseAdmin
            .from('excursions')
            .select('id')
            .eq('categoryId', legacyId); // Find items with old text ID

        if (fetchErr) {
            console.log(`   ⚠️ Error searching for ${legacyId}: ${fetchErr.message}`);
            continue;
        }

        if (itemsToUpdate && itemsToUpdate.length > 0) {
            console.log(`   Found ${itemsToUpdate.length} items. Updating...`);
            const { error: updateErr } = await supabaseAdmin
                .from('excursions')
                .update({ categoryId: uuid })
                .eq('categoryId', legacyId);

            if (updateErr) console.error(`   ❌ Update failed: ${updateErr.message}`);
            else console.log(`   ✅ Success!`);
        } else {
            console.log(`   No items found (already fixed?).`);
        }
    }
}

fixRelations();
