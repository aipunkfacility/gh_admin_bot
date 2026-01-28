
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { readJsonFile, getFullImageUrl } from '../src/lib/bot/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

async function debug() {
    try {
        console.log('\n--- Checking Tours Content ---');
        const excursions = await readJsonFile('excursions.json');
        const targets = ['vinh-hy-bay', 'nya-phu-islands', 'vinpearl-nha-trang'];

        excursions.filter(e => targets.includes(e.id)).forEach(e => {
            console.log(`\nTour: ${e.title} (ID: ${e.id})`);
            console.log(`- shortDescription: ${e.shortDescription || 'MISSING'}`);
            console.log(`- priceFrom: ${e.priceFrom || 'MISSING'}`);
            console.log(`- image: ${e.image}`);
            console.log(`- tgImage: ${e.tgImage}`);
            console.log(`- Full Image URL (tgImage || image): ${getFullImageUrl(e.tgImage || e.image)}`);
        });

        console.log('\n--- Checking Accommodations Images ---');
        const accommodations = await readJsonFile('accommodations.json');
        accommodations.forEach(a => {
            console.log(`\nAccommodation: ${a.title} (ID: ${a.id})`);
            console.log(`- image: ${a.image}`);
            console.log(`- tgImage: ${a.tgImage}`);
            console.log(`- Full Image URL (tgImage || image): ${getFullImageUrl(a.tgImage || a.image)}`);
        });

    } catch (error) {
        console.error('Debug failed:', error);
    }
}

debug();
