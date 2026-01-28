
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

/**
 * Escapes string values for SQL
 */
function escapeSql(val) {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
    return `'${val.toString().replace(/'/g, "''")}'`;
}

async function backup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups');
    const sqlFile = path.join(backupDir, `backup_${timestamp}.sql`);

    try {
        await fs.mkdir(backupDir, { recursive: true });
        console.log(`📂 Generating SQL backup: ${sqlFile}`);

        let sqlContent = `-- Supabase SQL Data Dump\n-- Generated on: ${new Date().toLocaleString()}\n\n`;
        sqlContent += "BEGIN;\n\n";

        for (const table of TABLES) {
            console.log(`📦 Exporting table: ${table}...`);
            const { data, error } = await supabase.from(table).select('*');

            if (error) {
                console.error(`❌ Error fetching ${table}:`, error.message);
                continue;
            }

            if (!data || data.length === 0) {
                console.log(`   (Table ${table} is empty)`);
                continue;
            }

            sqlContent += `-- Data for table: ${table}\n`;
            // Note: We don't TRUNCATE for safety, but we use UPSERT-like logic or just comments
            // sqlContent += `TRUNCATE TABLE ${table} CASCADE;\n`; 

            for (const row of data) {
                const columns = Object.keys(row);
                const values = columns.map(col => escapeSql(row[col]));

                sqlContent += `INSERT INTO public."${table}" ("${columns.join('", "')}") VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
            }
            sqlContent += `\n`;
        }

        sqlContent += "COMMIT;\n";
        await fs.writeFile(sqlFile, sqlContent);

        console.log(`\n✅ SQL Backup saved to: ${sqlFile}`);
        console.log(`\n💡 ИНСТРУКЦИЯ: Чтобы восстановить этот бэкап, просто скопируй содержимое файла и вставь его в SQL Editor в Supabase Dashboard.`);
    } catch (error) {
        console.error('❌ SQL Backup failed:', error);
    }
}

backup();
