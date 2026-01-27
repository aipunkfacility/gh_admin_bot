
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });
const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(url, key);

async function checkSections() {
    console.log('🔍 Inspecting Sections...');
    const { data: sections, error } = await admin.from('sections').select('*');

    if (error) console.error('❌ Error:', error);
    else {
        console.log(`✅ Total Sections: ${sections.length}`);
        sections.forEach(s => console.log(`   - [${s.id}] ${s.title} (Active: ${s.isActive}) Order: ${s.order}`));
    }
}

checkSections();
