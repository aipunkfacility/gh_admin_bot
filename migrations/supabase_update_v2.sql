
-- 1. Create 'sections' table if not exists
CREATE TABLE IF NOT EXISTS public.sections (
    id text PRIMARY KEY,
    title text NOT NULL,
    "slug" text NOT NULL,
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

-- 2. Add 'tgText' and 'order' columns to existing tables if missing

-- transport_items
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "tgText" text;
ALTER TABLE public.transport_items ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;

-- excursions
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS "tgText" text;
ALTER TABLE public.excursions ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;

-- accommodations
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS "tgText" text;
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;

-- services
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS "tgText" text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;

-- transport_categories
ALTER TABLE public.transport_categories ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;

-- excursion_categories
ALTER TABLE public.excursion_categories ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;

-- 3. Create index for ordering (optional but good)
CREATE INDEX IF NOT EXISTS sections_order_idx ON public.sections ("order");
CREATE INDEX IF NOT EXISTS transport_items_order_idx ON public.transport_items ("order");
CREATE INDEX IF NOT EXISTS excursions_order_idx ON public.excursions ("order");
CREATE INDEX IF NOT EXISTS services_order_idx ON public.services ("order");
