
-- Add icon column to sections table
ALTER TABLE public.sections 
ADD COLUMN IF NOT EXISTS "icon" text;

-- Ensure RLS allows insert/update for service role (implicit, but good to check)
-- (Service role bypasses RLS, so this is fine)
