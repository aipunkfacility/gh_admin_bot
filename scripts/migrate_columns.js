
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const MAPPINGS = {
    excursions: {
        is_active: 'isActive',
        is_popular: 'isPopular',
        category_id: 'categoryId',
        price_from: 'priceFrom',
        short_description: 'shortDescription'
    },
    accommodations: {
        is_active: 'isActive',
        is_popular: 'isPopular',
        tg_image: 'tgImage',
        territory_description: 'territoryDescription',
        room_features: 'roomFeatures'
    },
    services: {
        is_active: 'isActive',
        is_popular: 'isPopular',
        price_from: 'priceFrom',
        short_description: 'shortDescription',
        tg_image: 'tgImage'
    },
    transport_items: {
        is_active: 'isActive',
        is_popular: 'isPopular',
        use_cases: 'useCases',
        tg_image: 'tgImage'
    }
};

async function migrate() {
    for (const [table, mapping] of Object.entries(MAPPINGS)) {
        console.log(`\n--- Migrating table: ${table} ---`);
        const { data, error } = await supabase.from(table).select('*');

        if (error) {
            console.error(`Error fetching ${table}:`, error.message);
            continue;
        }

        console.log(`Found ${data.length} rows.`);

        for (const row of data) {
            const updates = {};
            let hasChanges = false;

            for (const [oldKey, newKey] of Object.entries(mapping)) {
                // Если новая колонка пуста, а старая нет - переносим
                if ((row[newKey] === null || row[newKey] === undefined || row[newKey] === '') &&
                    (row[oldKey] !== null && row[oldKey] !== undefined)) {
                    updates[newKey] = row[oldKey];
                    hasChanges = true;
                }
            }

            if (hasChanges) {
                console.log(`Updating row ID ${row.id} (${row.slug || row.title})...`);
                const { error: updateError } = await supabase
                    .from(table)
                    .update(updates)
                    .eq('id', row.id);

                if (updateError) {
                    console.error(`Error updating row ${row.id}:`, updateError.message);
                }
            }
        }
    }
    console.log('\n✅ Migration finished.');
}

migrate();
