
-- SQL Cleanup Script: Drop redundant legacy columns
-- RUN THIS ONLY AFTER RUNNING migrate_columns.js

BEGIN;

-- 1. Excursions
ALTER TABLE public.excursions 
  DROP COLUMN IF EXISTS is_active,
  DROP COLUMN IF EXISTS is_popular,
  DROP COLUMN IF EXISTS category_id,
  DROP COLUMN IF EXISTS price_from,
  DROP COLUMN IF EXISTS short_description;

-- 2. Accommodations
ALTER TABLE public.accommodations 
  DROP COLUMN IF EXISTS is_active,
  DROP COLUMN IF EXISTS is_popular,
  DROP COLUMN IF EXISTS tg_image,
  DROP COLUMN IF EXISTS territory_description,
  DROP COLUMN IF EXISTS room_features;

-- 3. Services
ALTER TABLE public.services 
  DROP COLUMN IF EXISTS is_active,
  DROP COLUMN IF EXISTS is_popular,
  DROP COLUMN IF EXISTS price_from,
  DROP COLUMN IF EXISTS short_description,
  DROP COLUMN IF EXISTS tg_image;

-- 4. Transport Items
ALTER TABLE public.transport_items 
  DROP COLUMN IF EXISTS is_active,
  DROP COLUMN IF EXISTS is_popular,
  DROP COLUMN IF EXISTS use_cases,
  DROP COLUMN IF EXISTS tg_image;

COMMIT;
