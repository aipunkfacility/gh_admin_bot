
// Scripts run in Node (tsx), so we need to polyfill import.meta.env or use process.env
// But data-store.ts uses import.meta.env.
// This is tricky. ASTRO builds replace import.meta.env.
// In raw TSX execution, we might need a workaround or check if tsx handles it.

import { saveItem, getItem, getCollection } from '../src/lib/data-store';
import dotenv from 'dotenv';
import path from 'path';

// Force load env
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Mock import.meta.env if needed (tsx might not support it fully like Vite)
// actually, let's see what happens.

async function testSupabase() {
    console.log('🧪 Testing Data Store Integration...');

    // We can't easily check the internal USE_SUPABASE constant without exporting it or checking behavior.
    // Let's try to write a test rate.

    const TEST_RATE = {
        id: 'TEST_USD',
        slug: 'TEST_USD',
        rate: 999.99
    };

    console.log('1. Saving Item (Rate)...');
    try {
        const saved = await saveItem('rates', TEST_RATE);
        console.log('   Saved:', saved);
    } catch (e: any) {
        console.error('   ❌ Save Error:', e.message);
    }

    console.log('2. Reading Collection (Rates)...');
    const rates = await getCollection('rates');
    console.log('   Rates Collection:', rates);

    if (rates['test_usd_rate'] === 999.99) {
        console.log('   ✅ PASS: Rate found in collection.');
    } else {
        console.log('   ❌ FAIL: Rate not found in collection.');
    }
}

testSupabase();
