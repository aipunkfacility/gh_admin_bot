
-- Create Excursions Table
CREATE TABLE IF NOT EXISTS public.excursions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    full_description TEXT,
    price INTEGER,
    hero_image TEXT,
    images TEXT[], -- JSON array or text array
    meta_title TEXT,
    meta_description TEXT,
    "categoryId" UUID, -- Foreign Key to Excursion Categories? No, simpler to just store uuid or slug. Let's use text or uuid if category exists. 
    -- Actually categories are mapped by ID. But category ids are UUID in DB?
    -- Let's stick to text ID for flexibility or check transport_categories schema.
    -- transport_categories has 'id' as text/uuid? schema said id, slug.
    -- Let's rely on flexible schema first or JSONB if unsure? 
    -- Let's use specific columns for better Admin structure.
    category_id TEXT,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Transport Items Table
CREATE TABLE IF NOT EXISTS public.transport_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER,
    price_detail TEXT, 
    image TEXT,
    images TEXT[],
    category_id TEXT, -- e.g. 'standard', 'comfort' (slug) or UUID?
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Services Table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    full_description TEXT,
    price TEXT, 
    price_detail TEXT,
    image TEXT,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Accommodations Table
CREATE TABLE IF NOT EXISTS public.accommodations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    full_description TEXT,
    price TEXT, 
    images TEXT[],
    hero_image TEXT,
    address TEXT,
    map_url TEXT,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.excursions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;

-- Policy: Public Read
CREATE POLICY "Public Read Excursions" ON public.excursions FOR SELECT USING (true);
CREATE POLICY "Public Read Transport" ON public.transport_items FOR SELECT USING (true);
CREATE POLICY "Public Read Services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public Read Accommodations" ON public.accommodations FOR SELECT USING (true);

-- Policy: Admin Full Access (assuming service role or auth)
CREATE POLICY "Admin Full Excursions" ON public.excursions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Transport" ON public.transport_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Services" ON public.services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Accommodations" ON public.accommodations FOR ALL USING (true) WITH CHECK (true);
