
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });
const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(url, key);

const defaultSections = [
    { id: 'popular', title: 'Популярное', icon: 'ri-fire-fill', isActive: true, order: 0, slug: 'popular' },
    { id: 'excursions', title: 'Экскурсии', icon: 'ri-caravan-fill', isActive: true, order: 1, slug: 'excursions' },
    { id: 'transport', title: 'Транспорт', icon: 'ri-roadster-fill', isActive: true, order: 2, slug: 'transport' },
    { id: 'accommodations', title: 'Жильё', icon: 'ri-hotel-fill', isActive: true, order: 3, slug: 'accommodations' },
    { id: 'services', title: 'Услуги', icon: 'ri-customer-service-2-fill', isActive: true, order: 4, slug: 'services' },
    { id: 'currency', title: 'Курсы валют', icon: 'ri-exchange-dollar-line', isActive: false, order: 5, slug: 'currency' },
    { id: 'contacts', title: 'Контакты', icon: 'ri-map-pin-fill', isActive: true, order: 6, slug: 'contacts' },
];

async function seed() {
    console.log('🌱 Seeding Sections...');

    for (const s of defaultSections) {
        // Map to DB columns (assuming title, slug, isActive, order)
        const payload = {
            id: s.id, // Using slug as ID or UUID? Let's check schema.
            // Schema likely uses UUID for id, but we can try to upsert by slug/title or force ID if UUID.
            // Wait, inspect output showed string IDs before (if it worked).
            // Let's assume standard columns.
            slug: s.id,
            title: s.title,
            icon: s.icon,
            order: s.order,
            isActive: s.isActive
        };

        // Try insert. If id is UUID, we can't force 'popular'.
        // If schema has text ID, we are good.
        // Let's try inserting without 'id' first (letting it auto-gen) or with 'slug' as conflicts.

        const { error } = await admin.from('sections').upsert(payload, { onConflict: 'slug' });

        if (error) {
            console.error(`Error inserting ${s.title}:`, error.message);
        } else {
            console.log(`✅ Inserted: ${s.title}`);
        }
    }
}

seed();
