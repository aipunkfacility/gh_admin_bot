-- Миграция: Добавление полей для SEO мета-описаний
-- Дата: 2026-01-29

-- 1. Таблица Экскурсии
ALTER TABLE excursions ADD COLUMN IF NOT EXISTS "metaDescription" TEXT;

-- 2. Таблица Транспорт
ALTER TABLE transport_items ADD COLUMN IF NOT EXISTS "metaDescription" TEXT;

-- 3. Таблица Жилье
ALTER TABLE accommodations ADD COLUMN IF NOT EXISTS "metaDescription" TEXT;

-- 4. Таблица Услуги
ALTER TABLE services ADD COLUMN IF NOT EXISTS "metaDescription" TEXT;

-- Комментарии к колонкам
COMMENT ON COLUMN excursions."metaDescription" IS 'SEO Meta Description (150-160 chars)';
COMMENT ON COLUMN transport_items."metaDescription" IS 'SEO Meta Description (150-160 chars)';
COMMENT ON COLUMN accommodations."metaDescription" IS 'SEO Meta Description (150-160 chars)';
COMMENT ON COLUMN services."metaDescription" IS 'SEO Meta Description (150-160 chars)';
