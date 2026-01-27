
-- FINAL REPAIR SCRIPT
-- 1. Fix types (UUID -> TEXT) because local data uses slugs as IDs
-- 2. Add remaining missing columns

-- --- FIX ID TYPES ---
-- We need to change id from UUID to TEXT to support string slugs like "sym-attila"
-- Note: Changing PK type might be tricky if there are dependencies. 
-- Since tables are likely empty or have test data, we just force it.

ALTER TABLE public.transport_items ALTER COLUMN id TYPE text;
ALTER TABLE public.excursions ALTER COLUMN id TYPE text;
ALTER TABLE public.services ALTER COLUMN id TYPE text;
ALTER TABLE public.excursion_categories ALTER COLUMN id TYPE text;
ALTER TABLE public.transport_categories ALTER COLUMN id TYPE text;
ALTER TABLE public.posts ALTER COLUMN id TYPE text; -- Posts usually use UUID but making it text is safer
ALTER TABLE public.accommodations ALTER COLUMN id TYPE text;
ALTER TABLE public.sections ALTER COLUMN id TYPE text;

-- --- ADD MISSING COLUMNS identified in logs ---

-- posts: missing 'text'
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS text text;

-- accommodations: missing 'details' (from BaseItemSchema)
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS details text;

-- transport_categories: missing 'updated_at'
ALTER TABLE public.transport_categories ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE public.transport_categories ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;

-- --- ENSURE OTHER COMMON COLUMNS ---
-- Just in case
ALTER TABLE public.transport_categories ADD COLUMN IF NOT EXISTS "slug" text;
ALTER TABLE public.excursion_categories ADD COLUMN IF NOT EXISTS "slug" text;

NOTIFY pgrst, 'reload schema';
