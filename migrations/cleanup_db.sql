
-- CLEANUP SCRIPT (Truncate all tables)
-- Use this to clear "garbage" data before a fresh migration.
-- WARNING: This deletes ALL data from these tables!

TRUNCATE TABLE public.posts CASCADE;
TRUNCATE TABLE public.transport_items CASCADE;
TRUNCATE TABLE public.excursions CASCADE;
TRUNCATE TABLE public.accommodations CASCADE;
TRUNCATE TABLE public.services CASCADE;
TRUNCATE TABLE public.transport_categories CASCADE;
TRUNCATE TABLE public.excursion_categories CASCADE;
TRUNCATE TABLE public.sections CASCADE;
TRUNCATE TABLE public.rates CASCADE;
TRUNCATE TABLE public.site_meta CASCADE;

-- Optional: Reset sequences if you were using serials (not needed for UUIDs/text IDs)
