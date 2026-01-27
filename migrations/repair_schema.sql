
-- REPAIR SCRIPT: Add missing columns to existing tables
-- Run this in Supabase SQL Editor to fix "Could not find column" errors.

-- 1. POSTS
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS "tgMessageId" text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS "createdAt" text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS "sentAt" text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;

-- 2. TRANSPORT ITEMS
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "categoryId" text;
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "pricePerDay" text;
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "pricePerMonth" text;
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "deposit" text;
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "useCases" text;
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS details text;
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS benefits text[];
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS specs text[];
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS features text[];
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true;
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "isPopular" boolean DEFAULT false;
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "tgText" text;
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "tgImage" text;
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "tgMessageId" text;

-- 3. EXCURSIONS
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS "categoryId" text;
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS "shortDescription" text;
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS details text;
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS "priceFrom" text;
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS duration text;
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true;
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS "isPopular" boolean DEFAULT false;
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS schedule text[];
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS included text[];
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS highlights text[];
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS "tgText" text;
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS "tgImage" text;
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS "tgMessageId" text;

-- 4. ACCOMMODATIONS
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS slogan text;
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS "priceStart" text;
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS "territoryDescription" text;
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS "locationDescription" text;
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS atmosphere text;
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS "roomFeatures" text[];
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true;
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS "tgText" text;
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS "tgImage" text;
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS "tgMessageId" text;

-- 5. SERVICES
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS "shortDescription" text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS details text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS "priceFrom" text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS schedule text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS features text[];
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS included text[];
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS requirements text[];
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS type text DEFAULT 'service';
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS "isPopular" boolean DEFAULT false;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS "tgText" text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS "tgImage" text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS "tgMessageId" text;

-- 6. TRANSPORT CATEGORIES
ALTER TABLE public.transport_categories ADD COLUMN IF NOT EXISTS "badgeTitle" text;
ALTER TABLE public.transport_categories ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true;
ALTER TABLE public.transport_categories ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;

-- 7. EXCURSION CATEGORIES
ALTER TABLE public.excursion_categories ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.excursion_categories ADD COLUMN IF NOT EXISTS icon text;
ALTER TABLE public.excursion_categories ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true;
ALTER TABLE public.excursion_categories ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;
ALTER TABLE public.excursion_categories ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE public.excursion_categories ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Force schema cache reload (sometimes needed)
NOTIFY pgrst, 'reload schema';
