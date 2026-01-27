
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });
const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(url, key);

async function inspectItems() {
    console.log('🔍 Inspecting Excursions...');
    const { data: excursions, error: eErr } = await admin.from('excursions').select('*');
    if (eErr) console.error('Excursions Error:', eErr);
    else {
        console.log(`Found ${excursions?.length} excursions.`);
        if (excursions?.length) console.log('Sample Excursion:', excursions[0]);
    }

    console.log('\n🔍 Inspecting Transport...');
    // Try both table names just in case
    let { data: transport, error: tErr } = await admin.from('transport').select('*');
    if (tErr) {
        console.log('Trying transport-items...');
        const { data: t2, error: t2Err } = await admin.from('transport-items').select('*');
        transport = t2;
        tErr = t2Err;
    }

    if (tErr) console.error('Transport Error:', tErr);
    else {
        console.log(`Found ${transport?.length} transport items.`);
        if (transport?.length) console.log('Sample Transport:', transport[0]);
    }
}

inspectItems();
