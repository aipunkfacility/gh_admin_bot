import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// Инициализация
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const DATA_FILE = path.join(process.cwd(), 'public', 'data', 'site-meta.json');

(async () => {
  console.log('🛠 Переписываем site_meta в аккуратный Singleton формат...');

  try {
    // 1. Читаем весь файл целиком
    const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    console.log('📦 Данные прочитаны успешно.');

    // 2. Очищаем таблицу перед записью (чтобы убрать мусор от прошлых попыток)
    // Используем трюк с .neq, чтобы удалить всё без строгого where
    const { error: deleteError } = await supabase
      .from('site_meta')
      .delete()
      .neq('key', 'null'); 

    if (deleteError) {
      // Если таблица пустая, может возникнуть ошибка, это не критично, идем дальше
      console.warn('⚠️ Предупреждение при очистке (возможно таблица была пуста):', deleteError.message);
    }

    // 3. Записываем ВСЁ содержимое файла в одну строку с ключом 'main'
    // Это сохранит структуру: contacts будет объектом, sections массивом и т.д.
    const { error } = await supabase
      .from('site_meta')
      .upsert({
        key: 'main',
        data: jsonData // Вставляем весь JSON как есть
      }, { onConflict: 'key' });

    if (error) {
      console.error('❌ Ошибка записи в Supabase:', error);
      process.exit(1);
    }

    console.log('✅ site_meta успешно обновлена! Теперь данные хранятся одной аккуратной записью.');
  } catch (err) {
    console.error('❌ Критическая ошибка:', err);
  }
})();