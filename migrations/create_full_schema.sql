
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. POSTS
CREATE TABLE IF NOT EXISTS public.posts (
    id text PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    title text,
    text text,
    image text,
    status text DEFAULT 'draft',
    "tgMessageId" text,
    "createdAt" text,
    "sentAt" text,
    "order" integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;

-- 2. TRANSPORT ITEMS
CREATE TABLE IF NOT EXISTS public.transport_items (
    id text PRIMARY KEY,
    title text NOT NULL,
    "categoryId" text,
    "pricePerDay" text,
    "pricePerMonth" text,
    "deposit" text,
    "useCases" text,
    image text,
    "isActive" boolean DEFAULT true,
    "isPopular" boolean DEFAULT false,
    benefits text[],
    specs text[],
    features text[],
    details text,
    "tgText" text,
    "tgImage" text,
    "tgMessageId" text,
    "order" integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "categoryId" text;
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "pricePerDay" text;
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "pricePerMonth" text;
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "deposit" text;
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "tgText" text;
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;

-- 3. EXCURSIONS
CREATE TABLE IF NOT EXISTS public.excursions (
    id text PRIMARY KEY,
    title text NOT NULL,
    "categoryId" text,
    "shortDescription" text,
    details text,
    "priceFrom" text,
    duration text,
    "isPopular" boolean DEFAULT false,
    "isActive" boolean DEFAULT true,
    image text,
    schedule text[],
    included text[],
    highlights text[],
    "tgText" text,
    "tgImage" text,
    "tgMessageId" text,
    "order" integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS "categoryId" text;
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS "shortDescription" text;
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS "tgText" text;
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;

-- 4. ACCOMMODATIONS
CREATE TABLE IF NOT EXISTS public.accommodations (
    id text PRIMARY KEY,
    title text NOT NULL,
    slogan text,
    address text,
    "priceStart" text,
    "territoryDescription" text,
    "locationDescription" text,
    atmosphere text,
    "roomFeatures" text[],
    image text,
    "isActive" boolean DEFAULT true,
    "tgText" text,
    "tgImage" text,
    "tgMessageId" text,
    "order" integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS "priceStart" text;
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS "tgText" text;
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;

-- 5. SERVICES
CREATE TABLE IF NOT EXISTS public.services (
    id text PRIMARY KEY,
    title text NOT NULL,
    "shortDescription" text,
    details text,
    "priceFrom" text,
    schedule text,
    features text[],
    included text[],
    requirements text[],
    type text DEFAULT 'service',
    "isActive" boolean DEFAULT true,
    "isPopular" boolean DEFAULT false,
    image text,
    "tgText" text,
    "tgImage" text,
    "tgMessageId" text,
    "order" integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS details text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS "tgText" text;

-- 6. TRANSPORT CATEGORIES
CREATE TABLE IF NOT EXISTS public.transport_categories (
    id text PRIMARY KEY,
    title text NOT NULL,
    slug text NOT NULL,
    "badgeTitle" text,
    "isActive" boolean DEFAULT true,
    "order" integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.transport_categories ADD COLUMN IF NOT EXISTS "badgeTitle" text;
ALTER TABLE public.transport_categories ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;

-- 7. EXCURSION CATEGORIES
CREATE TABLE IF NOT EXISTS public.excursion_categories (
    id text PRIMARY KEY,
    title text NOT NULL,
    slug text NOT NULL,
    icon text,
    "isActive" boolean DEFAULT true,
    "order" integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.excursion_categories ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true;
ALTER TABLE public.excursion_categories ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;

-- 8. SECTIONS
CREATE TABLE IF NOT EXISTS public.sections (
    id text PRIMARY KEY,
    title text NOT NULL,
    slug text NOT NULL,
    "heroTitle" text,
    "heroSubtitle" text,
    "heroImage" text,
    "isActive" boolean DEFAULT true,
    "tgMessageId" text,
    "tgImage" text,
    "tgText" text,
    "order" integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. RATES
CREATE TABLE IF NOT EXISTS public.rates (
    currency text PRIMARY KEY,
    rate numeric NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. SITE META
CREATE TABLE IF NOT EXISTS public.site_meta (
    key text PRIMARY KEY,
    data jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
