
-- REPAIR SCHEMA V3 (Based on migration logs)
-- Run this in Supabase SQL Editor to fix "Could not find column" errors.

-- 1. transport_categories: missing 'updated_at'
ALTER TABLE public.transport_categories ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE public.transport_categories ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 2. accommodations: missing 'details'
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS details text;

-- 3. Ensure other columns encountered in previous errors exist
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS text text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';

ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "categoryId" text;
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "pricePerDay" text;
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "useCases" text;
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "tgText" text;

ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS "categoryId" text;
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS "shortDescription" text;
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS "tgText" text;
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true;
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS "isPopular" boolean DEFAULT false;

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS "shortDescription" text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS "tgText" text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS "features" text[];

ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS "atmosphere" text;

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';
