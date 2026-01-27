# 📋 Обновленный чеклист миграции: JSON ➔ Supabase

Этот чеклист объединяет исходный план и рекомендации по обеспечению целостности данных и безопасности.

---

### 🛡️ Этап 0: Подготовка (Safety First)
- [ ] **Бэкап данных:** 
  ```bash
  cp -r public/data public/data_backup
  ```
  *Зачем: "Золотой образ" данных на случай критического сбоя.*
- [ ] **Проверка .env:** Убедиться, что `.env` добавлен в `.gitignore` (уже подтверждено: `.env*` в игноре).
- [ ] **Staging Project:** Создать проект `GreenHill-Dev` в Supabase для тестов.

---

### 🏗️ Этап 1: Инфраструктура и Схема
- [ ] **SQL Schema:** Применить схему из `MasterMigrationPlan.md`.
- [ ] **Маппинг таблиц:** Учесть трансформацию имен:
    - `transport-items.json` ➔ `transport_items`
    - `excursion-categories.json` ➔ `excursion_categories`
- [ ] **Типы данных:** Проверить, что массивы в JSON (например, `specs`, `highlights`) настроены как `text[]` в Postgres.

---

### 🚚 Этап 2: Миграция и Верификация
- [ ] **Запуск миграции:** Выполнить `node scripts/migrate.js`.
- [ ] **Скрипт верификации:** Запустить обновленный `scripts/verify-migration.js`.
    - *Обновление:* Скрипт теперь поддерживает проверку как массивов, так и одиночных объектов (site-meta).

---

### 🚀 Этап 3: Интеграция и Тесты
- [ ] **Feature Flag:** Установить `USE_SUPABASE=true` в `.env`.
- [ ] **Проверка SSR:** Убедиться, что страницы сайта корректно подтягивают данные из Supabase через `supabase` (Anon Key).
- [ ] **Проверка Admin:** Проверить сохранение данных через `supabaseAdmin` (Service Role Key).
- [ ] **Бот:** Проверить, что Telegram-бот видит переменную `USE_SUPABASE` и успешно подключается к БД.

---

### 🏁 Этап 4: Финализация
- [ ] **Production Sync:** Повторить этапы 1-2 для основного проекта Supabase.
- [ ] **Switch:** Переключить `USE_SUPABASE=true` на продакшене.
- [ ] **Cleanup:** Через неделю удалить `public/data` и `public/data_backup`.

---

## 🛠 Дополнение: Скрипт верификации (v2)
Этот скрипт учитывает маппинг имен и разницу между коллекциями (массивами) и мета-данными (объектами).

```javascript
// scripts/verify-migration.js
import fs from 'fs/promises';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verify(tableName, fileName, isObject = false) {
  const jsonPath = `public/data/${fileName}`;
  const jsonContent = JSON.parse(await fs.readFile(jsonPath, 'utf-8'));
  
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
}

(async () => {
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

### Таблица соответствия данных:


| Файл JSON              | Таблица Supabase    | Особенности                                                                  |
| :--------------------- | :------------------ | :--------------------------------------------------------------------------- |
| `site-meta.json`       | `site_meta`         | Singleton (одна строка с ключом 'main')                                      |
| `transport-items.json` | `transport_items`   | Массивы `specs`, `features`, `benefits` -> Postgres Array                    |
| `excursions.json`      | `excursions`        | Массивы `schedule`, `included`, `highlights` -> Postgres Array               |
| `admins.json`          | `admins` (или Auth) | Рекомендую использовать Supabase Auth вместо таблицы admins для безопасности |
```
