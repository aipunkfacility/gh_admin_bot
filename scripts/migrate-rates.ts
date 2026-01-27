import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const DATA_FILE = path.join(process.cwd(), 'public', 'data', 'rates.json');

(async () => {
  console.log('🔄 Миграция курсов валют (rates)...');

  try {
    // 1. Читаем JSON
    const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    const transformedData = jsonData.map((item: any) => ({
      currency: item.currency,
      rate: item.rate,
      buy_rate: item.buyRate || null,
      sell_rate: item.sellRate || null,
      bank_name: item.bankName || null,
      icon: item.icon || null,
      is_active: item.isActive ?? true
    }));

    // 2. Загружаем в Supabase (Upsert по id, если есть в JSON)
    const { error, count } = await supabase
      .from('rates')
      .upsert(transformedData, { 
        onConflict: 'currency', // Если валюта существует - обновим
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('❌ Ошибка миграции rates:', error);
      throw error;
    }

    console.log(`✅ Успешно перенесено ${count || transformedData.length} курсов валют.`);

  } catch (err) {
    console.error('❌ Критическая ошибка:', err);
  }
})();