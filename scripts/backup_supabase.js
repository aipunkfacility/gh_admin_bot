
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const TABLES = [
    'excursions',
    'accommodations',
    'services',
    'transport_items',
    'excursion_categories',
    'transport_categories',
    'site_meta',
    'posts',
    'rates'
];

async function backup() {
    const backupDir = path.join(process.cwd(), 'backups', new Date().toISOString().replace(/[:.]/g, '-'));

    try {
        await fs.mkdir(backupDir, { recursive: true });
        console.log(`📂 Creating backup in: ${backupDir}`);

        for (const table of TABLES) {
            console.log(`📦 Fetching table: ${table}...`);
            const { data, error } = await supabase.from(table).select('*');

            if (error) {
                console.error(`❌ Error fetching ${table}:`, error.message);
                continue;
            }

            const filePath = path.join(backupDir, `${table}.json`);
            await fs.writeFile(filePath, JSON.stringify(data, null, 2));
            console.log(`✅ Saved ${data.length} rows to ${table}.json`);
        }

        console.log(`\n🎉 Backup completed successfully! Check the 'backups' folder.`);
    } catch (error) {
        console.error('❌ Backup failed:', error);
    }
}

backup();
