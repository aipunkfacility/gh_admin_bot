
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

import fs from 'fs';

// 1. Load .env manually to be 100% sure
const envPath = path.join(process.cwd(), '.env');
console.log(`[WriteTest] Loading .env from: ${envPath}`);

if (!fs.existsSync(envPath)) {
    console.error('❌ .env file NOT FOUND!');
    process.exit(1);
}

dotenv.config({ path: envPath });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
    console.error('❌ Credentials missing');
    process.exit(1);
}

const supabase = createClient(url, key);

async function testWrite() {
    console.log('[WriteTest] Attempting to update a transport item...');

    // 1. Fetch first item to get valid ID
    const { data: items } = await supabase.from('transport_items').select('*').limit(1);

    if (!items || items.length === 0) {
        console.error('❌ No items to test update on.');
        return;
    }

    const item = items[0];
    console.log(`[WriteTest] Updatig item: ${item.title} (ID: ${item.id})`);

    // 2. Try to update 'updated_at' field (harmless)
    const { data, error } = await supabase
        .from('transport_items')
        .upsert({
            ...item,
            updated_at: new Date().toISOString(),
            // Ensure we aren't sending extra args that might cause error if strict
        })
        .select();

    if (error) {
        console.error('❌ Write FAILED!');
        console.error(error);
    } else {
        console.log('✅ Write SUCCESS!');
        console.log('   Updated:', data[0].updated_at);
    }
}

testWrite();
