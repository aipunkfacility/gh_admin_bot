import 'dotenv/config'; // Загружаем .env перед всем остальным
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// Инициализация клиента с Service Role (чтобы игнорировать RLS)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Отсутствуют SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY в .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

/**
 * Универсальная функция для миграции коллекций
 * @param tableName - имя таблицы в Supabase
 * @param fileName - имя файла в public/data (например, 'excursions.json')
 * @param transformFn - функция для маппинга полей (id -> slug и т.д.)
 */
async function migrateCollection<T>(
  tableName: string,
  fileName: string,
  transformFn: (item: any) => T
) {
  console.log(`🔄 Начинаем миграцию ${tableName}...`);

  try {
    const filePath = path.join(DATA_DIR, fileName);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    // Если это массив - мигрируем все элементы
    if (Array.isArray(jsonData)) {
      const transformedData = jsonData.map(transformFn);

      // Upsert: обновляем, если slug существует, иначе создаем
      const { error, count } = await supabase
        .from(tableName)
        .upsert(transformedData, { onConflict: 'slug' })
        .select();

      if (error) {
        console.error(`❌ Ошибка в ${tableName}:`, error.message);
        throw error;
      }

      console.log(`✅ Успешно перенесено ${count || transformedData.length} записей в ${tableName}`);
    } 
    // Если это объект (для site-meta)
    else {
      const transformedData = transformFn(jsonData);
      
      const { error } = await supabase
        .from(tableName)
        .upsert(transformedData, { onConflict: 'key' });

      if (error) {
        console.error(`❌ Ошибка в ${tableName}:`, error.message);
        throw error;
      }
      console.log(`✅ Успешно обновлены настройки сайта`);
    }
  } catch (err) {
    console.error(`❌ Критическая ошибка при миграции ${fileName}:`, err);
    process.exit(1);
  }
}

// ==========================================
//        ОПРЕДЕЛЕНИЕ МАППИНГОВ
// ==========================================

// 1. Категории Транспорта
await migrateCollection('transport_categories', 'transport-categories.json', (item) => ({
  slug: item.id,         // Старый ID становится Slug
  title: item.title,
  badge_title: item.badgeTitle,
  is_active: item.isActive ?? true
}));

// 2. Транспорт (Items)
await migrateCollection('transport_items', 'transport-items.json', (item) => ({
  slug: item.id,
  category_slug: item.categoryId, // Привязка к слагу категории
  title: item.title,
  price_per_day: item.pricePerDay,
  description: item.description,
  image: item.image,
  specs: item.specs || [], // Массивы проходят автоматом
  features: item.features || [],
  benefits: item.benefits || [],
  use_cases: item.useCases,
  is_active: item.isActive ?? true,
  is_popular: item.isPopular ?? false,
  tg_message_id: item.tgMessageId,
  // created_at не трогаем, используем default в БД
}));

// 3. Категории Экскурсий
await migrateCollection('excursion_categories', 'excursion-categories.json', (item) => ({
  slug: item.id,
  title: item.title,
  icon: item.icon,
  is_active: item.isActive ?? true
}));

// 4. Экскурсии
await migrateCollection('excursions', 'excursions.json', (item) => ({
  slug: item.id,
  category_slug: item.categoryId,
  title: item.title,
  short_description: item.shortDescription,
  details: item.details,
  price_from: item.priceFrom,
  duration: item.duration,
  
  // ✅ Защита: Если schedule строка -> превращаем в массив
  schedule: Array.isArray(item.schedule) ? item.schedule : [item.schedule],
  
  // ✅ Защита: Для остальных массивов на всякий случай
  included: Array.isArray(item.included) ? item.included : [item.included],
  highlights: Array.isArray(item.highlights) ? item.highlights : [item.highlights],
  
  image: item.image,
  is_active: item.isActive ?? true,
  is_popular: item.isPopular ?? false
}));

// 5. Жилье (Accommodations)
await migrateCollection('accommodations', 'accommodations.json', (item) => ({
  slug: item.id,
  title: item.title,
  description: item.description,
  price_per_night: item.pricePerNight,
  image: item.image,
  amenities: item.amenities || [],
  is_active: item.isActive ?? true,
  is_popular: item.isPopular ?? false
}));

// 6. Услуги (Services)
await migrateCollection('services', 'services.json', (item) => ({
  slug: item.id,
  title: item.title,
  description: item.description,
  image: item.image,
  is_active: item.isActive ?? true,
  is_popular: item.isPopular ?? false
}));

// 7. Посты (Blog)
await migrateCollection('posts', 'posts.json', (item) => ({
  slug: item.id,
  title: item.title,
  content: item.content,
  image: item.image,
  tg_text: item.tgText,
  is_active: item.isActive ?? true
}));

// 8. Настройки Сайта (Meta) - Особый случай (Singleton)
await migrateCollection('site_meta', 'site-meta.json', (item) => ({
  key: 'main', // Ключ должен быть 'main'
  data: item    // Весь JSON кладем в колонку data
}));

console.log('🎉 Миграция всех коллекций завершена успешно!');