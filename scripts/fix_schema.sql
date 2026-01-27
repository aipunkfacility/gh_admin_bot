-- Migration to add Telegram Support fields
-- Run this in Supabase Dashboard -> SQL Editor

-- 1. Transport Items
ALTER TABLE transport_items ADD COLUMN IF NOT EXISTS "tgText" text;
ALTER TABLE transport_items ADD COLUMN IF NOT EXISTS "tgImage" text;
ALTER TABLE transport_items ADD COLUMN IF NOT EXISTS "tgMessageId" text;
ALTER TABLE transport_items ADD COLUMN IF NOT EXISTS "pricePerDay" text;

-- 2. Excursions
ALTER TABLE excursions ADD COLUMN IF NOT EXISTS "tgText" text;
ALTER TABLE excursions ADD COLUMN IF NOT EXISTS "tgImage" text;
ALTER TABLE excursions ADD COLUMN IF NOT EXISTS "tgMessageId" text;

-- 3. Verify
SELECT * FROM transport_items LIMIT 1;
