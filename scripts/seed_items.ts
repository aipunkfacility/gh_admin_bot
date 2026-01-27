
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(url, key);

async function seedCollection(jsonFile: string, tableName: string) {
    console.log(`\n🌱 Seeding ${tableName} from ${jsonFile}...`);
    try {
        const filePath = path.join(process.cwd(), 'public', 'data', jsonFile);
        const data = await fs.readFile(filePath, 'utf-8');
        const items = JSON.parse(data);

        if (!items || !items.length) {
            console.log('No items found to seed.');
            return;
        }

        const payload = items.map((item: any, index: number) => {
            // Clean up item for DB
            const p: any = {
                slug: item.id, // Use legacy ID as slug
                title: item.title || item.name,
                description: item.description,

                // Mix of Snake and Camel case to hit whatever column exists
                is_active: item.isActive !== false,
                isActive: item.isActive !== false,

                is_popular: item.isPopular === true,
                isPopular: item.isPopular === true,

                order: index,
                updated_at: new Date().toISOString()
            };

            // Map specific fields based on table
            if (tableName === 'excursions') {
                const price = parseInt(item.price) || 0;
                p.price_from = price;
                p.priceFrom = price;

                // p.hero_image = item.image; // Does not exist
                p.image = item.image;

                // p.category_id = item.categoryId; // Does not exist
                p.categoryId = item.categoryId;

                // Excursions use 'shortDescription' not 'description'
                p.shortDescription = item.description;
                p.short_description = item.description;
                delete p.description;
            }
            if (tableName === 'transport_items') {
                const price = parseInt(item.price) || 0;
                // Transport uses pricePerDay
                p.pricePerDay = price;
                p.price_per_day = price;

                p.image = item.image;
                // p.category_id = item.categoryId; // Does not exist
                p.categoryId = item.categoryId;
            }
            if (tableName === 'contacts') return null; // Skip contacts if JSON has it mixed? No, separate.

            return p;
        }).filter((x: any) => x !== null);

        // Upsert by slug
        const { error } = await admin.from(tableName).upsert(payload, { onConflict: 'slug' });

        if (error) {
            console.error(`❌ Error seeding ${tableName}:`, error);
        } else {
            console.log(`✅ Seeded ${payload.length} items to ${tableName}`);
        }

    } catch (e) {
        console.error(`⚠️ Failed to seed ${tableName} (file missing?):`, e);
    }
}

async function seedAll() {
    await seedCollection('excursions.json', 'excursions');
    await seedCollection('transport-items.json', 'transport_items');
    await seedCollection('services.json', 'services');
    await seedCollection('accommodations.json', 'accommodations');
}

seedAll();
