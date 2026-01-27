import { createClient } from '@supabase/supabase-js';
import { getEnv } from './env-helper';

const supabaseUrl = getEnv('SUPABASE_URL')!;
const supabaseKey = getEnv('SUPABASE_ANON_KEY')!;
const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')!;

// 1. Публичный клиент (для чтения на сайте)
// Использует ANON ключ. Подчиняется RLS (Row Level Security).
export const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Админский клиент (для записи в API и миграций)
// Использует SERVICE ROLE ключ. Имеет полный доступ.
// ⛔ НЕ ИСПОЛЬЗОВАТЬ В КЛИЕНТСКОМ КОДЕ (.astro)
export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});