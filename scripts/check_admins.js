
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdminsTable() {
    console.log('🚀 Checking admins table...');

    // Check if table exists by selecting
    const { data, error } = await supabase.from('admins').select('*').limit(1);

    if (error && error.code === '42P01') {
        console.log('⚠️ Table admins does not exist. Creating via RPC or informing user...');

        // Since we can't run DDL via client easily without RPC, we will try to use a specific function if available, 
        // or just log that we need to run SQL.
        // However, we can cheat if we have a SQL runner function.
        // If not, we will output the SQL for the user to run in Supabase Dashboard.

        console.log(`
    ❌ AUTOMATIC CREATION FAILED (Client requires DDL access).
    
    PLEASE RUN THIS SQL IN SUPABASE DASHBOARD -> SQL EDITOR:
    
    CREATE TABLE IF NOT EXISTS public.admins (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id BIGINT NOT NULL,
      username TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
    
    -- Policy to allow read access
    CREATE POLICY "Allow read access for all" ON public.admins FOR SELECT USING (true);
    `);
    } else if (data) {
        console.log('✅ Table admins already exists.');
    } else {
        console.error('❌ Unknown error:', error);
    }
}

createAdminsTable();
