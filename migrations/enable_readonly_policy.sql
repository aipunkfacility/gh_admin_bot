
-- ENABLE PUBLIC READ ACCESS
-- The tables exist, but 'anon' role cannot see them implies RLS is blocking SELECT.

-- 1. Enable RLS on all tables (good practice, though might already be on)
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

-- 2. Create Policy: Allow Public Read (SELECT) for everyone
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

-- 3. Allow Service Role to do EVERYTHING (usually automatic, but good to ensure conflicts don't block)
-- (No need, Service Role overrides RLS)
