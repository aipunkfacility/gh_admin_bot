import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { readJsonFile } from '../src/lib/bot/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

console.log('--- NORM TEST START ---');
try {
    const data = await readJsonFile('transport-items.json');
    console.log(`Received ${data.length} items`);
    const ford = data.find(i => i.title && i.title.includes('Ford'));
    if (ford) {
        console.log('Found Ford in result:', JSON.stringify(ford, null, 2));
    } else {
        console.log('Ford NOT found in result array');
    }
} catch (e) {
    console.error('Error:', e);
}
