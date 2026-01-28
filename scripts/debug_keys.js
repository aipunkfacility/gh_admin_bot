import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function normalizeItem(item) {
    const normalized = { ...item };
    normalized.isActive = normalized.isActive ?? normalized.is_active;
    normalized.pricePerDay = normalized.pricePerDay ?? normalized.price_per_day;
    normalized.useCases = normalized.useCases ?? normalized.use_cases;
    return normalized;
}

async function checkKeys() {
    console.log(`\n🔎 Fetching Ford Ranger...`);
    const { data, error } = await supabase
        .from('transport_items')
        .select('*')
        .ilike('title', '%Ford%')
        .limit(1);

    if (error) {
        console.log(`❌ Error: ${error.message}`);
    } else if (data.length > 0) {
        const item = data[0];
        console.log('🔑 Raw Keys:', JSON.stringify(Object.keys(item).sort()));
        console.log('📝 use_cases:', item.use_cases);
        console.log('📝 useCases:', item.useCases);

        const norm = normalizeItem(item);
        console.log('✨ Normalized useCases:', norm.useCases);
    } else {
        console.log('⚠️ Ford not found.');
    }
}

await checkKeys();
