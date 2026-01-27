# **🚀 Master Migration Plan: JSON to Supabase (Safe Hybrid Strategy)**

Этот документ — дорожная карта миграции проекта gh\_admin\_bot с локальных JSON-файлов на Supabase (PostgreSQL).

**Стратегия:** Гибридная, с использованием Feature Flags для безопасного переключения и возможностью мгновенного отката (Zero Downtime).

## **🛡️ Critical Safety Protocols (Обязательно к прочтению)**

Перед началом работ внедряем 5 правил безопасности:

1. **Разделение клиентов (Anon vs Admin):**  
   * supabase (Anon Key): Только для чтения на клиенте/SSR. Подчиняется RLS.  
   * supabaseAdmin (Service Role): Только для API маршрутов и скриптов. Игнорирует RLS. **Никогда не импортировать в клиентский код.**  
2. **Feature Flag (USE\_SUPABASE):**  
   * Внедряем переключатель в код. Если что-то пойдет не так, мы меняем true на false в .env и мгновенно возвращаемся к JSON.  
3. **Изображения остаются локально (v1):**  
   * Не переносим файлы в Supabase Storage сейчас. В БД храним только путь (/images/car.jpg), который продолжает вести на папку public/images.  
4. **Изоляция Бота:**  
   * Бот запускается отдельным процессом и требует своего подключения к БД (через supabaseAdmin или отдельный инстанс).  
5. **Staging Environment:**  
   * Сначала мигрируем на отдельный **Dev-проект** в Supabase. Только после успешных тестов переносим схему на Prod.

## **🏗 Фаза 1: Инфраструктура и Схема (Staging)**

**Цель:** Подготовить тестовую среду, зеркалирующую структуру данных.

### **1.1. Setup**

1. Создать **новый проект** в Supabase (Free Tier) для тестов.  
2. Настроить .env (локально):  
   PUBLIC\_SUPABASE\_URL=\[https://your-dev-project.supabase.co\](https://your-dev-project.supabase.co)  
   PUBLIC\_SUPABASE\_ANON\_KEY=...  
   SUPABASE\_SERVICE\_ROLE\_KEY=...  
   USE\_SUPABASE=false  \# Пока выключено

### **1.2. SQL Schema**

Выполнить в SQL Editor Supabase.

*Архитектура:* UUID для Primary Key, но сохраняем slug (Unique) для обратной совместимости URL и связей.

\-- 1\. Enable UUID  
create extension if not exists "uuid-ossp";

\-- 2\. Site Meta (Singleton)  
create table site\_meta (  
  key text primary key, \-- 'main'  
  data jsonb not null  
);

\-- 3\. Categories  
create table transport\_categories (  
  id uuid default uuid\_generate\_v4() primary key,  
  slug text unique not null,  
  title text not null,  
  badge\_title text,  
  description text,  
  is\_active boolean default true  
);

create table excursion\_categories (  
  id uuid default uuid\_generate\_v4() primary key,  
  slug text unique not null,  
  title text not null,  
  icon text,  
  description text,  
  is\_active boolean default true  
);

\-- 4\. Items (Transport)  
create table transport\_items (  
  id uuid default uuid\_generate\_v4() primary key,  
  slug text unique not null,  
  category\_slug text references transport\_categories(slug) on update cascade,  
  title text not null,  
  price\_per\_day text,  
  image text,         \-- Храним путь к локальному файлу  
  specs text\[\],       \-- Postgres Array  
  features text\[\],  
  benefits text\[\],  
  use\_cases text,  
  description text,  
  is\_active boolean default true,  
  is\_popular boolean default false,  
  tg\_message\_id text,  
  created\_at timestamptz default now()  
);

\-- 5\. Items (Excursions)  
create table excursions (  
  id uuid default uuid\_generate\_v4() primary key,  
  slug text unique not null,  
  category\_slug text references excursion\_categories(slug) on update cascade,  
  title text not null,  
  short\_description text,  
  details text,  
  price\_from text,  
  duration text,  
  schedule text\[\],  
  included text\[\],  
  highlights text\[\],  
  image text,  
  is\_active boolean default true,  
  is\_popular boolean default false,  
  created\_at timestamptz default now()  
);

\-- 6\. Indexes & RLS  
create index idx\_transport\_slug on transport\_items(slug);  
create index idx\_excursion\_slug on excursions(slug);

alter table transport\_items enable row level security;  
alter table site\_meta enable row level security;  
\-- (Повторить для всех таблиц)

\-- Разрешить чтение всем (Public)  
create policy "Public Read All" on transport\_items for select using (true);  
create policy "Public Read Meta" on site\_meta for select using (true);  
create policy "Public Read Excursions" on excursions for select using (true);  
create policy "Public Read TransCats" on transport\_categories for select using (true);  
create policy "Public Read ExcCats" on excursion\_categories for select using (true);

## **🚚 Фаза 2: Миграция Данных (ETL Script)**

**Цель:** Залить данные из JSON в Dev-базу.

### **2.1. Скрипт scripts/migrate.js**

Скрипт использует SUPABASE\_SERVICE\_ROLE\_KEY.

**Ключевые моменты:**

* Использует upsert с onConflict: 'slug'.  
* Преобразует JSON-массивы в Postgres Array.  
* **Изображения:** Просто копирует строковый путь (напр. /images/bmw.jpg) в колонку image. Физические файлы не трогаем.

### **2.2. Запуск**

node scripts/migrate.js

*Check:* Проверить в Dashboard Supabase, что данные появились.

## **🧠 Фаза 3: Data Layer (Implementation)**

**Цель:** Внедрить логику чтения из БД с возможностью переключения.

### **3.1. Клиент (src/lib/supabase.ts)**

Реализуем паттерн разделения прав доступа.

import { createClient } from '@supabase/supabase-js';

// 1\. Клиент для сайта (Read Only, RLS applied)  
export const supabase \= createClient(  
  import.meta.env.PUBLIC\_SUPABASE\_URL\!,  
  import.meta.env.PUBLIC\_SUPABASE\_ANON\_KEY\!  
);

// 2\. Клиент для API/Admin (Write Access, Bypass RLS)  
// ВНИМАНИЕ: Использовать только в серверных эндпоинтах (src/pages/api)  
export const supabaseAdmin \= import.meta.env.SUPABASE\_SERVICE\_ROLE\_KEY  
  ? createClient(  
      import.meta.env.PUBLIC\_SUPABASE\_URL\!,  
      import.meta.env.SUPABASE\_SERVICE\_ROLE\_KEY\!  
    )  
  : null;

### **3.2. Data Store с Feature Flag (src/lib/data-store.ts)**

Вся магия безопасной миграции здесь.

import { supabase, supabaseAdmin } from './supabase';  
import fs from 'node:fs/promises'; // Для фоллбэка  
import path from 'node:path';

// 🔥 Feature Flag  
const USE\_SUPABASE \= import.meta.env.USE\_SUPABASE \=== 'true';

export async function getCollection(name: string) {  
  if (USE\_SUPABASE) {  
    // 🅰️ New Way: Supabase  
    // Маппинг имен файлов на таблицы  
    const table \= name.replace('.json', '').replace('-', '\_');   
      
    const { data, error } \= await supabase.from(table).select('\*');  
    if (error) {  
      console.error('Supabase Error:', error);  
      return \[\]; // Или throw error  
    }  
      
    // Адаптер: Возвращаем slug как id для фронтенда  
    return data.map(item \=\> ({  
      ...item,  
      id: item.slug,   // Frontend ждет id  
      \_uuid: item.id   // Сохраняем реальный UUID  
    }));  
  } else {  
    // 🅱️ Old Way: JSON Files (Fallback)  
    return readLocalJson(name);   
  }  
}

export async function saveItem(name: string, item: any) {  
  if (USE\_SUPABASE) {  
    if (\!supabaseAdmin) throw new Error('No Service Role Key');  
      
    const table \= name.replace('.json', '').replace('-', '\_');  
    const { id, ...rest } \= item; // id здесь \- это slug от фронтенда  
      
    await supabaseAdmin.from(table).upsert({  
      slug: id,  
      ...rest  
    }, { onConflict: 'slug' });  
  } else {  
    // Old JSON save logic  
  }  
}

## **🔌 Фаза 4: API и Бот**

### **4.1. API Routes**

Обновить src/pages/api/\*\*. Убедиться, что они используют saveItem/deleteItem из data-store, а не пишут в файлы напрямую.

### **4.2. Telegram Bot**

Бот работает вне контекста Astro SSR.

* Если бот импортирует data-store.ts, убедитесь, что dotenv загружен до инициализации бота, чтобы он видел флаг USE\_SUPABASE.  
* Если бот "вешается" (Long Polling), его нужно перезапускать при деплое.

## **🚀 Фаза 5: Тестирование и Релиз**

### **5.1. Локальный тест**

1. Установить USE\_SUPABASE=true в .env.  
2. Запустить npm run dev.  
3. Пройтись по сайту. Работают ли товары? Категории?  
4. Зайти в /admin. Изменить цену. Проверить в Supabase Dashboard.

### **5.2. Production Rollout**

1. **Deploy Code:** Задеплоить код на сервер с USE\_SUPABASE=false (пока работаем на JSON).  
2. **Sync Data:** Запустить миграцию на **Production Supabase Project** (поменяв ключи в .env локально и запустив скрипт).  
3. **Switch:** Поменять переменную окружения на сервере: USE\_SUPABASE=true.  
4. **Restart:** Перезапустить приложение.  
5. **Verify:** Проверить работу.  
   * *Есть ошибки?* \-\> Вернуть USE\_SUPABASE=false \-\> Разбираться локально.  
   * *Все ок?* \-\> Поздравляю, вы в облаке\! 🎉

### **5.3. Cleanup (Через неделю)**

Удалить папку public/data и ветку кода с логикой else { readLocalJson }.