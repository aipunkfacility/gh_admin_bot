
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 1. Load .env manually to be 100% sure
const envPath = path.join(process.cwd(), '.env');
console.log(`[Diag] Loading .env from: ${envPath}`);

if (!fs.existsSync(envPath)) {
    console.error('❌ .env file NOT FOUND!');
    process.exit(1);
}

dotenv.config({ path: envPath });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use admin key to be sure permissions aren't the issue

console.log(`[Diag] URL: ${url ? url.substring(0, 20) + '...' : 'MISSING'}`);
console.log(`[Diag] KEY: ${key ? 'FOUND' : 'MISSING'}`);

if (!url || !key) {
    console.error('❌ Credentials missing in .env');
    process.exit(1);
}

const supabase = createClient(url, key);

async function testConnection() {
    console.log('[Diag] Testing connection to table "transport_items"...');
    const start = Date.now();

    try {
        const { data, error, count } = await supabase
            .from('transport_items')
            .select('*', { count: 'exact', head: true }); // Head request for speed

        const duration = Date.now() - start;

        if (error) {
            console.error('❌ Connection FAILED!');
            console.error('   Code:', error.code);
            console.error('   Message:', error.message);
            console.error('   Hint:', error.hint);
            console.error('   Details:', error.details);
        } else {
            console.log(`✅ Connection SUCCESS in ${duration}ms`);
            console.log(`   Items Total: ${count}`);

            console.log('\n--- TRANSPORT ITEMS ---');
            data.forEach(item => {
                console.log(`   [${item.id}] ${item.title} (Cat: ${item.categoryId || item.category_id}, Active: ${item.isActive || item.is_active})`);
            });

            // Check Categories too
            const { data: cats, error: errCat } = await supabase.from('transport_categories').select('*');
            console.log('\n--- CATEGORIES ---');
            if (cats) {
                cats.forEach(c => console.log(`   [${c.id}] ${c.title} (Active: ${c.isActive || c.is_active})`));
            } else {
                console.log('   Error fetching categories:', errCat?.message);
            }

        }
    } catch (err) {
        console.error('❌ CRITICAL NETWORK ERROR');
        console.error(err);
    }
}

testConnection();
