// scripts/verify-migration.js
import fs from 'fs/promises';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL || '', 
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function verify(tableName, fileName, isObject = false) {
  try {
    const jsonPath = `public/data/${fileName}`;
    const fileContent = await fs.readFile(jsonPath, 'utf-8');
    const jsonContent = JSON.parse(fileContent);
    
    let jsonCount = isObject ? 1 : (Array.isArray(jsonContent) ? jsonContent.length : 0);
    
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error(`❌ Ошибка при запросе к ${tableName}:`, error.message);
      return false;
    }

    console.log(`📊 ${tableName}: JSON=${jsonCount} | Supabase=${count}`);
    
    if (jsonCount !== count) {
      console.error(`❌ НЕСОВПАДЕНИЕ в ${tableName}!`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`❌ Ошибка при обработке ${tableName}:`, err.message);
    return false;
  }
}

(async () => {
  if (!process.env.PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('🚨 Ошибка: Не установлены переменные окружения PUBLIC_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const checks = [
    { table: 'transport_items', file: 'transport-items.json' },
    { table: 'excursions', file: 'excursions.json' },
    { table: 'transport_categories', file: 'transport-categories.json' },
    { table: 'excursion_categories', file: 'excursion-categories.json' },
    { table: 'site_meta', file: 'site-meta.json', isObject: true }
  ];

  let allOk = true;
  for (const check of checks) {
    const ok = await verify(check.table, check.file, check.isObject);
    if (!ok) allOk = false;
  }

  if (allOk) {
    console.log('🎉 Верификация прошла успешно. Все данные на месте!');
  } else {
    console.error('🚨 Миграция содержит ошибки. Проверьте логи выше.');
    process.exit(1);
  }
})();
