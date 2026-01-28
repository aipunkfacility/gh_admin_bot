
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectItem() {
    try {
        const { data, error } = await supabase
            .from('excursions')
            .select('*')
            .eq('slug', 'nya-phu-islands')
            .single();

        if (error) console.error(error);
        else {
            console.log('Keys:', Object.keys(data));
            console.log('Full data:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('Inspection failed:', error);
    }
}

inspectItem();
