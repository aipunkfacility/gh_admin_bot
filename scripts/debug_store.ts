
import { getCollection } from '../src/lib/data-store';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function debugStore() {
    console.log('🔍 Fetching excursions via getCollection...');
    try {
        const items = await getCollection('excursions');
        console.log(`Found ${items.length} items.`);
        if (items.length > 0) {
            console.log('Sample Item:', JSON.stringify(items[0], null, 2));
        } else {
            console.log('❌ No items returned!');
        }
    } catch (e) {
        console.error('❌ Error fetching collection:', e);
    }
}

debugStore();
