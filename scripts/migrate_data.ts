
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

const collections = [
    'posts',
    'transport-items',
    'excursions',
    'accommodations',
    'services',
    'sections',
    'transport-categories',
    'excursion-categories',
    'rates' // specialized
];

async function migrate() {
    console.log('🚀 Starting migration...');

    // 1. Migrate Collections
    for (const col of collections) {
        console.log(`\nProcessing ${col}...`);
        const fileName = `${col}.json`;
        const filePath = path.join(DATA_DIR, fileName);

        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const items = JSON.parse(content);

            const tableName = col.replace(/-/g, '_').replace('.json', '');

            if (tableName === 'rates') {
                // Rates is an object { rub_rate: 300, ... }
                // Need to convert to array [{ currency: 'RUB', rate: 300 }]

                // If items is object (not array), transform it
                let ratesArray = [];
                if (!Array.isArray(items) && typeof items === 'object') {
                    ratesArray = Object.entries(items).map(([key, value]) => {
                        const currency = key.replace('_rate', '').toUpperCase();
                        return {
                            currency: currency,
                            rate: value,
                            updated_at: new Date().toISOString()
                        };
                    });
                } else {
                    console.log(`⚠️  Skipping ${col}: expected object for rates, got ${typeof items}`);
                    continue;
                }

                const { error } = await supabaseAdmin
                    .from(tableName)
                    .upsert(ratesArray, { onConflict: 'currency' });

                if (error) {
                    console.error(`❌ Error migrating ${col}:`, error.message);
                } else {
                    console.log(`✅ Migrated ${ratesArray.length} items to '${tableName}'`);
                }
                continue; // Skip standard array processing
            }

            if (!Array.isArray(items)) {
                console.log(`⚠️  Skipping ${col}: Not an array (content: ${typeof items})`);
                continue;
            }

            if (items.length === 0) {
                console.log(`ℹ️  Skipping ${col}: Empty array`);
                continue;
            }

            // Prepare items (transform if needed)
            const itemsToUpsert = items.map((item, index) => {
                const { id, ...rest } = item;

                return {
                    ...item,
                    id: id,
                    slug: id,
                    order: index,
                    updated_at: new Date().toISOString(),
                };
            });

            // Batch upsert
            const { error } = await supabaseAdmin
                .from(tableName)
                .upsert(itemsToUpsert, { onConflict: 'id' });

            if (error) {
                console.error(`❌ Error migrating ${col}:`, error.message);
            } else {
                console.log(`✅ Migrated ${items.length} items to '${tableName}'`);
            }

        } catch (err: any) {
            if (err.code === 'ENOENT') {
                console.log(`ℹ️  File ${fileName} not found. Skipping.`);
            } else {
                console.error(`❌ Error reading ${col}:`, err.message);
            }
        }
    }

    // 2. Migrate Site Meta
    console.log('\nProcessing site-meta...');
    try {
        const content = await fs.readFile(path.join(DATA_DIR, 'site-meta.json'), 'utf-8');
        const data = JSON.parse(content);

        const { error } = await supabaseAdmin
            .from('site_meta')
            .upsert({ key: 'main', data: data }, { onConflict: 'key' });

        if (error) {
            console.error('❌ Error migrating site-meta:', error.message);
        } else {
            console.log('✅ Migrated site-meta');
        }

    } catch (err: any) {
        console.error('❌ Error processing site-meta:', err.message);
    }

    console.log('\n✨ Migration finished!');
}

migrate();
