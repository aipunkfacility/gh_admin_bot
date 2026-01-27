
-- Add Unique Constraint to sections.slug to allow UPSERT
ALTER TABLE public.sections
ADD CONSTRAINT sections_slug_key UNIQUE (slug);
