
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('Testing Connection with Service Key...');
console.log('URL:', url);
console.log('Key (last 5):', key.slice(-5));

const admin = createClient(url, key);

async function check() {
    const { data, error } = await admin.from('rates').select('*');
    if (error) {
        console.error('❌ Error:', error);
    } else {
        console.log(`✅ Success! Rows: ${data.length}`);
    }
}

check();
