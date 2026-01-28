
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    try {
        console.log('\n--- Excursions Sample ---');
        const { data: exc, error: err1 } = await supabase.from('excursions').select('*').limit(1);
        if (err1) console.error(err1);
        else console.log(Object.keys(exc[0]));

        console.log('\n--- Accommodations Sample ---');
        const { data: acc, error: err2 } = await supabase.from('accommodations').select('*').limit(1);
        if (err2) console.error(err2);
        else console.log(Object.keys(acc[0]));

        console.log('\n--- Services Sample ---');
        const { data: serv, error: err3 } = await supabase.from('services').select('*').limit(1);
        if (err3) console.error(err3);
        else console.log(Object.keys(serv[0]));

    } catch (error) {
        console.error('Check failed:', error);
    }
}

checkSchema();
