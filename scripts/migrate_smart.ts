
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

// --- Mappings ---
// Slug -> UUID
const transportCategoryMap = new Map<string, string>();
const excursionCategoryMap = new Map<string, string>();

async function loadCategoryMap(table: string, map: Map<string, string>) {
    const { data, error } = await supabaseAdmin.from(table).select('id, slug');
    if (error) {
        console.error(`❌ Error loading ${table}:`, error.message);
        return;
    }
    data.forEach(row => {
        if (row.slug) map.set(row.slug, row.id);
    });
    console.log(`🗺️  Loaded ${map.size} categories from ${table}`);
}

async function migrateCategories(filename: string, table: string, map: Map<string, string>) {
    console.log(`\n📦 Processing Categories: ${filename}...`);
    try {
        const content = await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
        const items = JSON.parse(content);

        for (const item of items) {
            const slug = item.slug || item.id; // JSON id is usually slug for cats
            if (!slug) continue;

            // Prepare payload
            const payload: any = {
                slug: slug,
                title: item.title,
                isActive: item.isActive,
                order: item.order || 0,
                updated_at: new Date().toISOString()
            };
            if (item.badgeTitle) payload.badgeTitle = item.badgeTitle;
            if (item.icon) payload.icon = item.icon;

            // Check if exists by slug to get UUID
            let uuid = map.get(slug);

            if (uuid) {
                // Update
                const { error } = await supabaseAdmin.from(table).update(payload).eq('id', uuid);
                if (error) console.error(`   ❌ Failed update ${slug}:`, error.message);
            } else {
                // Insert
                // We don't send ID, let DB generate UUID
                // BUT we need to know the UUID after insert to update map!
                const { data, error } = await supabaseAdmin.from(table).insert(payload).select('id').single();
                if (error) {
                    console.error(`   ❌ Failed insert ${slug}:`, error.message);
                } else if (data) {
                    uuid = data.id;
                    // @ts-ignore
                    if (slug) map.set(String(slug), uuid);
                }
            }
        }
        console.log(`✅ ${table} synced. Map size: ${map.size}`);

    } catch (err: any) {
        if (err.code === 'ENOENT') console.log(`   ⚠️ File ${filename} not found.`);
        else console.error(`   ❌ Error: ${err.message}`);
    }
}

async function migrateItems(filename: string, table: string, categoryMap?: Map<string, string>) {
    console.log(`\n📄 Processing Items: ${filename}...`);
    try {
        const content = await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
        const items = JSON.parse(content);

        let successCount = 0;

        for (const [index, item] of items.entries()) {
            const slug = item.slug || item.id; // JSON id is slug

            // Resolve Category ID
            let categoryId = item.categoryId;
            if (categoryMap && categoryId) {
                const uuid = categoryMap.get(categoryId); // Try to find UUID by slug
                if (uuid) {
                    categoryId = uuid;
                } else {
                    console.warn(`   ⚠️ Category '${categoryId}' not found in map for item '${slug}'. Keeping as is (might fail if UUID required).`);
                }
            }

            // Helper to ensure array
            const ensureArray = (val: any) => {
                if (Array.isArray(val)) return val;
                if (typeof val === 'string') return [val];
                return val; // undefined or null
            };

            // Prepare payload
            const payload: any = {
                slug: slug,
                title: item.title,
                image: item.image,
                isActive: item.isActive,
                isPopular: item.isPopular,
                order: index,
                updated_at: new Date().toISOString(),
                // Descriptions
                details: item.details,
                shortDescription: item.shortDescription,
                useCases: item.useCases,
                // Prices
                priceFrom: item.priceFrom,
                pricePerDay: item.pricePerDay,
                pricePerMonth: item.pricePerMonth,
                deposit: item.deposit,
                priceStart: item.priceStart, // accommod
                // Arrays (Normalized)
                benefits: ensureArray(item.benefits),
                specs: ensureArray(item.specs),
                features: ensureArray(item.features),
                schedule: ensureArray(item.schedule),
                included: ensureArray(item.included),
                highlights: ensureArray(item.highlights),
                roomFeatures: ensureArray(item.roomFeatures),
                requirements: ensureArray(item.requirements),
                // Locations
                address: item.address,
                territoryDescription: item.territoryDescription,
                locationDescription: item.locationDescription,
                atmosphere: item.atmosphere,
                slogan: item.slogan,
                // Telegram
                tgText: item.tgText,
                tgImage: item.tgImage,
                tgMessageId: item.tgMessageId,

                // FK
                categoryId: categoryId
            };

            // Clean undefined
            Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

            // Upsert Logic:
            // 1. Try to find by slug
            const { data: existing } = await supabaseAdmin.from(table).select('id').eq('slug', slug).maybeSingle();

            if (existing) {
                const { error } = await supabaseAdmin.from(table).update(payload).eq('id', existing.id);
                if (error) console.error(`   ❌ Update failed for ${slug}:`, error.message);
                else successCount++;
            } else {
                const { error } = await supabaseAdmin.from(table).insert(payload);
                if (error) console.error(`   ❌ Insert failed for ${slug}:`, error.message);
                else successCount++;
            }
        }
        console.log(`✅ ${table}: ${successCount}/${items.length} done.`);

    } catch (err: any) {
        if (err.code === 'ENOENT') console.log(`   ⚠️ File ${filename} not found.`);
        else console.error(`   ❌ Error: ${err.message}`);
    }
}

async function migrateRates() {
    console.log(`\n💰 Processing Rates...`);
    try {
        const content = await fs.readFile(path.join(DATA_DIR, 'rates.json'), 'utf-8');
        const items = JSON.parse(content);

        let ratesArray = [];
        if (!Array.isArray(items) && typeof items === 'object') {
            ratesArray = Object.entries(items).map(([key, value]) => {
                const currency = key.replace('_rate', '').toUpperCase();
                return { currency, rate: value };
            });
        } else if (Array.isArray(items)) {
            ratesArray = items;
        }

        for (const r of ratesArray) {
            const payload = {
                currency: r.currency || r.id, // Handle both formats
                rate: r.rate,
                updated_at: new Date().toISOString()
            };

            // Rates usually keyed by ID (UUID) or Currency (Unique)?
            // Let's check if 'currency' column is unique. Usually yes.
            // If table has UUID PK, we need to find record by currency first.

            const { data: existing } = await supabaseAdmin.from('rates').select('id').eq('currency', payload.currency).maybeSingle();

            if (existing) {
                await supabaseAdmin.from('rates').update(payload).eq('id', existing.id);
            } else {
                await supabaseAdmin.from('rates').insert(payload);
            }
        }
        console.log(`✅ Rates synced.`);

    } catch (err: any) {
        console.log(`   ⚠️ Error processing rates: ${err.message}`);
    }
}

async function startSmartMigration() {
    console.log('🚀 Starting Smart Migration (Mapping Slugs to UUIDs)...');

    // 1. Pre-load Maps
    await loadCategoryMap('transport_categories', transportCategoryMap);
    await loadCategoryMap('excursion_categories', excursionCategoryMap);

    // 2. Sync Categories (and update Maps)
    await migrateCategories('transport-categories.json', 'transport_categories', transportCategoryMap);
    await migrateCategories('excursion-categories.json', 'excursion_categories', excursionCategoryMap);

    // 3. Sync Items
    await migrateItems('transport-items.json', 'transport_items', transportCategoryMap);
    await migrateItems('excursions.json', 'excursions', excursionCategoryMap);

    // 4. Other Items (No FK to categories yet or simple ones)
    await migrateItems('accommodations.json', 'accommodations');
    await migrateItems('services.json', 'services');
    await migrateItems('posts.json', 'posts');
    await migrateItems('sections.json', 'sections');

    // 5. Rates
    await migrateRates();

    // 6. Site Meta
    console.log('\n⚙️  Processing Site Meta...');
    try {
        const content = await fs.readFile(path.join(DATA_DIR, 'site-meta.json'), 'utf-8');
        const data = JSON.parse(content);
        // Assuming site_meta has key='main'
        const { error } = await supabaseAdmin.from('site_meta').upsert({ key: 'main', data: data }, { onConflict: 'key' });
        if (error) console.error('   ❌ Meta error:', error.message);
        else console.log('✅ Site Meta synced.');
    } catch (e) { }

    console.log('\n✨ Smart Migration Finished!');
}

startSmartMigration();
