
-- FINAL REPAIR SCHEMA V4
-- Fix for 'accommodations' missing 'isPopular' column

ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS "isPopular" boolean DEFAULT false;

-- Also adding 'type' just in case (seen in JSON)
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS "type" text;

NOTIFY pgrst, 'reload schema';
