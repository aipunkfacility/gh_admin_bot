import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { readJsonFile } from '../src/lib/bot/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

console.log('--- FILTER DIAGNOSIS START ---');

async function run() {
    try {
        console.log('1. Reading items...');
        let items = await readJsonFile('transport-items.json');
        console.log(`   Initial count: ${items ? items.length : 'null'}`);

        if (!items || items.length === 0) return;

        // Check first item structure
        const first = items[0];
        console.log('   Sample item keys:', Object.keys(first).join(', '));
        console.log(`   Sample item isActive: ${first.isActive} (${typeof first.isActive})`);
        console.log(`   Sample item categoryId: ${first.categoryId} (${typeof first.categoryId})`);

        console.log('2. Filtering by isActive === true...');
        const activeItems = items.filter(i => i.isActive === true);
        console.log(`   Active count: ${activeItems.length}`);

        if (items.length > 0 && activeItems.length === 0) {
            console.log('   ⚠️ ALL items filtered out by isActive!');
            console.log('   First item isActive val:', items[0].isActive);
        }

        console.log('3. Filtering by categoryId === "car"...');
        const carItems = activeItems.filter(i => i.categoryId === 'car');
        console.log(`   Car count: ${carItems.length}`);

        if (activeItems.length > 0 && carItems.length === 0) {
            console.log('   ⚠️ ALL active items filtered out by categoryId!');
            const carCandidates = activeItems.filter(i => i.title.toLowerCase().includes('ford') || i.title.toLowerCase().includes('corolla'));
            if (carCandidates.length > 0) {
                console.log('   Candidate car categoryId:', carCandidates[0].categoryId);
            }
        }

    } catch (e) {
        console.error('❌ Error:', e);
    }
    console.log('--- FILTER DIAGNOSIS END ---');
}

run();
