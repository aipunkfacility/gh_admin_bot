
-- ENABLE PUBLIC READ ACCESS V2 (Idempotent)
-- Drops existing policies before creating new ones to avoid "already exists" errors.

DO $$
BEGIN
    -- 1. Drop existing policies
    DROP POLICY IF EXISTS "Public Read Posts" ON public.posts;
    DROP POLICY IF EXISTS "Public Read Transport" ON public.transport_items;
    DROP POLICY IF EXISTS "Public Read Excursions" ON public.excursions;
    DROP POLICY IF EXISTS "Public Read Accommodations" ON public.accommodations;
    DROP POLICY IF EXISTS "Public Read Services" ON public.services;
    DROP POLICY IF EXISTS "Public Read TranspCats" ON public.transport_categories;
    DROP POLICY IF EXISTS "Public Read ExcurCats" ON public.excursion_categories;
    DROP POLICY IF EXISTS "Public Read Sections" ON public.sections;
    DROP POLICY IF EXISTS "Public Read Rates" ON public.rates;
    DROP POLICY IF EXISTS "Public Read Meta" ON public.site_meta;
END $$;

-- 2. Ensure RLS is enabled
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excursions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excursion_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_meta ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies (Allow Public Select)
CREATE POLICY "Public Read Posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Public Read Transport" ON public.transport_items FOR SELECT USING (true);
CREATE POLICY "Public Read Excursions" ON public.excursions FOR SELECT USING (true);
CREATE POLICY "Public Read Accommodations" ON public.accommodations FOR SELECT USING (true);
CREATE POLICY "Public Read Services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public Read TranspCats" ON public.transport_categories FOR SELECT USING (true);
CREATE POLICY "Public Read ExcurCats" ON public.excursion_categories FOR SELECT USING (true);
CREATE POLICY "Public Read Sections" ON public.sections FOR SELECT USING (true);
CREATE POLICY "Public Read Rates" ON public.rates FOR SELECT USING (true);
CREATE POLICY "Public Read Meta" ON public.site_meta FOR SELECT USING (true);

NOTIFY pgrst, 'reload schema';
