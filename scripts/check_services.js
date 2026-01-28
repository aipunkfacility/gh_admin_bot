
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkServices() {
    const { data, error } = await supabase.from('services').select('id, slug, title, isActive');

    if (error) {
        console.error('Error fetching services:', error.message);
        return;
    }

    console.log('--- Services in DB ---');
    data.forEach(s => {
        console.log(`Slug: "${s.slug}", ID: "${s.id}", Title: "${s.title}", Active: ${s.isActive}`);
    });
}

checkServices();
