
-- 🔥 GIGA-CLEANUP SQL v3: ФИНАЛЬНАЯ И ПОЛНАЯ УНИФИКАЦИЯ
-- Этот скрипт переименовывает системные колонки во ВСЕХ таблицах (включая секции и категории).
-- После него в базе не останется ни одного нижнего подчеркивания.

BEGIN;

DO $$ 
DECLARE 
    t text; 
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('excursions', 'accommodations', 'services', 'transport_items', 'excursion_categories', 'transport_categories', 'posts', 'sections', 'site_meta', 'transport_categories_json') 
    LOOP
        -- Обработка created_at -> "createdAt"
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'created_at') THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'createdAt') THEN
                EXECUTE format('UPDATE public.%I SET "createdAt" = created_at WHERE "createdAt" IS NULL', t);
                EXECUTE format('ALTER TABLE public.%I DROP COLUMN created_at', t);
            ELSE
                EXECUTE format('ALTER TABLE public.%I RENAME COLUMN created_at TO "createdAt"', t);
            END IF;
        END IF;

        -- Обработка updated_at -> "updatedAt"
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'updated_at') THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'updatedAt') THEN
                EXECUTE format('UPDATE public.%I SET "updatedAt" = updated_at WHERE "updatedAt" IS NULL', t);
                EXECUTE format('ALTER TABLE public.%I DROP COLUMN updated_at', t);
            ELSE
                EXECUTE format('ALTER TABLE public.%I RENAME COLUMN updated_at TO "updatedAt"', t);
            END IF;
        END IF;
    END LOOP;
END $$;

-- 2. Удаляем остальные "змеиные" дубликаты
-- Excursions
ALTER TABLE public.excursions 
  DROP COLUMN IF EXISTS is_active,
  DROP COLUMN IF EXISTS is_popular,
  DROP COLUMN IF EXISTS category_id,
  DROP COLUMN IF EXISTS price_from,
  DROP COLUMN IF EXISTS short_description,
  DROP COLUMN IF EXISTS tg_message_id;

-- Accommodations
ALTER TABLE public.accommodations 
  DROP COLUMN IF EXISTS is_active,
  DROP COLUMN IF EXISTS is_popular,
  DROP COLUMN IF EXISTS tg_image,
  DROP COLUMN IF EXISTS territory_description,
  DROP COLUMN IF EXISTS room_features,
  DROP COLUMN IF EXISTS tg_message_id,
  DROP COLUMN IF EXISTS price_per_night;

-- Services
ALTER TABLE public.services 
  DROP COLUMN IF EXISTS is_active,
  DROP COLUMN IF EXISTS is_popular,
  DROP COLUMN IF EXISTS price_from,
  DROP COLUMN IF EXISTS short_description,
  DROP COLUMN IF EXISTS tg_image,
  DROP COLUMN IF EXISTS tg_message_id;

-- Transport
ALTER TABLE public.transport_items 
  DROP COLUMN IF EXISTS is_active,
  DROP COLUMN IF EXISTS is_popular,
  DROP COLUMN IF EXISTS use_cases,
  DROP COLUMN IF EXISTS tg_image,
  DROP COLUMN IF EXISTS tg_message_id,
  DROP COLUMN IF EXISTS category_slug,
  DROP COLUMN IF EXISTS price_per_day;

COMMIT;
