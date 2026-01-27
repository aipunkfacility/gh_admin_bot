import { getEnv } from './env-helper';
import { supabase, supabaseAdmin } from './supabase';
import fs from 'fs/promises';
import path from 'path';
import type { PostgrestError } from '@supabase/supabase-js';

// 🚦 Feature Flag: Переключатель между JSON и Supabase
const USE_SUPABASE = getEnv('USE_SUPABASE') === 'true';
console.log(`🔌 [DataStore] Initialized. USE_SUPABASE=${USE_SUPABASE} (Value: ${getEnv('USE_SUPABASE')})`);

// Путь к папке с данными (для фоллбэка)
const DATA_DIR = path.join(process.cwd(), 'public', 'data');

// ==========================================
//           HELPER ФУНКЦИИ
// ==========================================

/**
 * Преобразует имя файла в имя таблицы
 */
function getTableName(collectionName: string): string {
  let name = collectionName;

  if (name.endsWith('.json')) {
    name = name.slice(0, -5);
  }

  if (name.includes('-')) {
    name = name.replace(/-/g, '_');
  }

  return name;
}

/**
 * Обработка ошибок
 */
function handleSupabaseError(error: PostgrestError | null, context: string) {
  if (error) {
    console.error(`❌ Supabase Error [${context}]:`, error);
    throw new Error(error.message);
  }
}

// ==========================================
//           СОХРАНЕНИЕ КОЛЛЕКЦИЙ (SAVE ALL)
// ==========================================

export async function saveCollection(collectionName: string, items: any[]) {
  if (USE_SUPABASE) {
    const table = getTableName(collectionName);

    // Add 'order' field based on array index to persist reordering
    const itemsWithOrder = items.map((item, index) => {
      const payload = { ...item };

      // Restore real UUID if present (from getCollection normalization)
      if (payload._uuid) {
        payload.id = payload._uuid;
      }

      // Remove internal helper fields
      delete payload._uuid;

      return {
        ...payload,
        order: index,
        updated_at: new Date().toISOString()
      };
    });

    const { error } = await supabaseAdmin
      .from(table)
      .upsert(itemsWithOrder, { onConflict: 'id' }); // Assuming 'id' is always PK/unique

    handleSupabaseError(error, `saveCollection(${collectionName})`);
    return true;
  } else {
    const fileName = collectionName.endsWith('.json') ? collectionName : `${collectionName}.json`;
    const filePath = path.join(DATA_DIR, fileName);
    await fs.writeFile(filePath, JSON.stringify(items, null, 2));
    return true;
  }
}

export async function saveSingleObject(fileName: string, data: any) {
  if (USE_SUPABASE) {
    if (fileName === 'site-meta.json') {
      return saveSiteMeta(data);
    }

    // Fallback for other single files if any
    console.warn(`[Supabase] saveSingleObject for ${fileName} not explicitly handled. Trying generic upsert to 'site_meta' style tables?`);
    // Currently only site-meta is used as single object.
    return false;
  } else {
    const filePath = path.join(DATA_DIR, fileName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  }
}

// ==========================================
//           ЧТЕНИЕ ДАННЫХ (GET)
// ==========================================

export async function getSiteMeta() {
  if (USE_SUPABASE) {
    const { data, error } = await supabaseAdmin // FORCE ADMIN
      .from('site_meta')
      .select('data')
      .eq('key', 'main')
      .single();
    handleSupabaseError(error, 'getSiteMeta');
    return data?.data || {};
  } else {
    const filePath = path.join(DATA_DIR, 'site-meta.json');
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }
}

export async function getCollection<T = any>(name: string): Promise<T> {
  if (USE_SUPABASE) {
    const table = getTableName(name);

    // 1. Формируем запрос
    let query = supabaseAdmin.from(table).select('*');

    // Сортировка: применяем 'order' только если это не спец-таблицы без этой колонки
    if (table !== 'rates' && table !== 'site_meta') {
      query = query.order('order', { ascending: true });
    }

    // Всегда сортируем по дате создания вторично (кроме site_meta)
    if (table !== 'site_meta') {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    // 2. Зонтик безопасности (Fallback на файлы, если таблицы нет)
    if (error) {
      // 42703 = undefined_column, 42P01 = undefined_table
      // Если ошибка в колонке - это баг кода, а не отсутствие таблицы!
      if (error.code !== '42P01' && !error.message.includes('does not exist')) {
        console.error(`🚨 Supabase Error (${table}): ${error.message} (Code: ${error.code})`);
      }

      if (error.code === '42P01' || error.message.includes('relation "public.' + table + '" does not exist')) {
        console.warn(`⚠️ Таблица '${table}' не найдена (42P01). Используем локальный JSON: ${name}.json`);
        const fileName = name.endsWith('.json') ? name : `${name}.json`;
        const filePath = path.join(DATA_DIR, fileName);
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
      } else {
        // Если ошибка другая (например, column does not exist) - мы должны ее видеть, но для стабильности вернем пустой массив или упадем
        handleSupabaseError(error, `getCollection(${name})`);
        return [] as unknown as T;
      }
    }

    // 3. Специфичная логика для разных таблиц

    // Site Meta - Singleton
    if (table === 'site_meta' && data && data[0]) {
      return data[0].data as unknown as T;
    }

    // Rates - Array -> Object (для совместимости с компонентом)
    if (table === 'rates') {
      const ratesObject: Record<string, number> = {};
      (data || []).forEach((item: any) => {
        const key = `${item.currency.toLowerCase()}_rate`;
        ratesObject[key] = Number(item.rate);
      });
      return ratesObject as unknown as T;
    }

    // Остальные таблицы - стандартный мапинг + нормализация
    const normalizedItems = (data || []).map((item: any) => {
      const normalized: any = { ...item };

      // Normalize common snake_case to camelCase
      if (normalized.is_active !== undefined && normalized.isActive === undefined) {
        normalized.isActive = normalized.is_active;
      }
      if (normalized.badge_title !== undefined && normalized.badgeTitle === undefined) {
        normalized.badgeTitle = normalized.badge_title;
      }

      // Ensure ID/UUID stability
      return {
        ...normalized,
        id: normalized.slug || normalized.id,
        _uuid: normalized.id
      };
    });

    return normalizedItems as unknown as T;

  } else {
    // Если Supabase выключен - читаем из JSON
    const fileName = name.endsWith('.json') ? name : `${name}.json`;
    const filePath = path.join(DATA_DIR, fileName);
    const content = await fs.readFile(filePath, 'utf-8');
    const parsedData = JSON.parse(content);
    return parsedData as T;
  }
}

export async function getItem(collectionName: string, id: string) {
  // FIX: Site-meta - возвращает весь объект
  if (collectionName.includes('site-meta')) {
    return await getSiteMeta();
  }

  // FIX: Rates - извлекаем из объекта { rub_rate: 310 }
  if (collectionName.includes('rates')) {
    const allRates = await getCollection('rates') as Record<string, number>;
    const key = `${id.toLowerCase()}_rate`;
    const value = allRates[key];

    if (value === undefined) return null;

    return {
      id: id,
      rate: value
    };
  }

  if (USE_SUPABASE) {
    const table = getTableName(collectionName);
    const { data, error } = await supabaseAdmin // FORCE ADMIN
      .from(table)
      .select('*')
      .eq('slug', id)
      .single();

    handleSupabaseError(error, `getItem(${collectionName}, ${id})`);

    if (!data) return null;

    return {
      ...data,
      id: data.slug,
      _uuid: data.id
    };
  } else {
    // JSON Logic
    const items = await getCollection(collectionName);
    return items.find((item: any) => item.id === id) || null;
  }
}

// ==========================================
//           ЗАПИСЬ ДАННЫХ (SAVE/UPSERT)
// ==========================================

export async function saveSiteMeta(data: any) {
  if (USE_SUPABASE) {
    const { error } = await supabaseAdmin
      .from('site_meta')
      .upsert({ key: 'main', data: data }, { onConflict: 'key' });

    handleSupabaseError(error, 'saveSiteMeta');
    return true;
  } else {
    const filePath = path.join(DATA_DIR, 'site-meta.json');
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  }
}

export async function saveItem(collectionName: string, item: any) {
  if (USE_SUPABASE) {
    const table = getTableName(collectionName);
    const { id, slug, ...rest } = item;

    // FIX: Special Logic for Site Meta (Singleton JSONB)
    if (table === 'site_meta' || collectionName.includes('site-meta')) {
      return await saveSiteMeta(item);
    }

    // FIX: Special Logic for Rates
    // Админка может передать ID через 'slug' или 'id'. Мы берем, что есть.
    if (table === 'rates') {
      const currencyKey = id || slug; // Например, 'RUB'
      if (!currencyKey) throw new Error('ID валюты не передан');

      const payload = {
        ...rest,
        currency: currencyKey, // Маппим ID в колонку currency
        rate: rest.rate,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseAdmin
        .from(table)
        .upsert(payload, { onConflict: 'currency' })
        .select()
        .single();

      handleSupabaseError(error, `saveItem(${collectionName})`);

      return {
        ...data,
        id: data.currency, // Возвращаем ID как currency
        rate: data.rate
      };
    }

    // --- SMART KEY HANDLING ---
    // The frontend often uses 'slug' as 'id' for legacy reasons.
    // We need to unwrap this.

    // Initialize payload
    const payload: any = {
      ...rest,
      updated_at: new Date().toISOString()
    };

    // 1. Try to find the REAL ID (UUID)
    let realId = item._uuid; // Often passed from frontend if we sent it
    if (!realId && id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      realId = id;
    }

    // 2. Identify Slug
    // If id is NOT a UUID, it's likely a slug
    let realSlug = slug;
    if (!realSlug && id && id !== realId) {
      realSlug = id;
    }

    // 3. Construct Payload
    if (realId) payload.id = realId;
    if (realSlug) payload.slug = realSlug;

    // Remove internal helper fields
    delete payload._uuid;

    // 4. Determine Conflict Key
    let conflictKey = 'id';

    if (table === 'sections') {
      conflictKey = 'slug';
      if (!payload.slug && payload.id) payload.slug = payload.id;
      // IMPORTANT FIX: Sections use text ID (slug) as Primary Key, not UUID.
      // So we MUST ensure payload.id is set, otherwise DB throws 'null value in column "id"'.
      if (!payload.id && payload.slug) payload.id = payload.slug;
    } else {
      // For standard tables (transport, etc) which use UUID
      if (!realId && realSlug) {
        conflictKey = 'slug';
        // IMPORTANT: Must ensure we don't send a garbage string as 'id'
        // if the table expects UUID
        delete payload.id;
      } else if (realId) {
        conflictKey = 'id';
        payload.id = realId;
      }
    }

    console.log(`[DataStore] Saving ${table}: id=${payload.id}, slug=${payload.slug}, conflict=${conflictKey}`);

    const { data, error } = await supabaseAdmin
      .from(table)
      .upsert(payload, { onConflict: conflictKey })
      .select()
      .single();

    handleSupabaseError(error, `saveItem(${collectionName})`);

    return {
      ...data,
      id: data.id || data.slug,
      _uuid: data.id
    };

  } else {
    // JSON Logic
    const fileName = `${collectionName}.json`;
    const filePath = path.join(DATA_DIR, fileName);
    const items = await getCollection(collectionName);

    const index = items.findIndex((i: any) => i.id === item.id);

    if (index >= 0) {
      items[index] = item; // Update
    } else {
      items.push(item);   // Create
    }

    await fs.writeFile(filePath, JSON.stringify(items, null, 2));
    return item;
  }
}

export async function deleteItem(collectionName: string, id: string) {
  if (USE_SUPABASE) {
    const table = getTableName(collectionName);

    // FIX: Rates удаление по currency
    if (table === 'rates') {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq('currency', id);
      handleSupabaseError(error, `deleteItem(${collectionName})`);
      return true;
    }

    // Smart Deletion (UUID vs Text ID)
    let deleteKey = 'slug';
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      deleteKey = 'id';
    }

    // Exception for sections (always text ID)
    if (table === 'sections') {
      deleteKey = 'slug';
    }

    // Standard Deletion
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .eq(deleteKey, id);

    handleSupabaseError(error, `deleteItem(${collectionName})`);
    return true;

  } else {
    // JSON Logic
    const fileName = `${collectionName}.json`;
    const filePath = path.join(DATA_DIR, fileName);
    const items = await getCollection(collectionName);

    const newItems = items.filter((i: any) => i.id !== id);
    await fs.writeFile(filePath, JSON.stringify(newItems, null, 2));
    return true;
  }
}

export async function reorderCollection(collectionName: string, newOrderIds: string[]) {
  // Reorder для Supabase пока не реализован (требует колонку order)
  if (USE_SUPABASE) {
    console.warn('⚠️ Reorder для Supabase пока не реализован.');
    return;
  } else {
    // JSON Logic
  }
}