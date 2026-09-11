-- REPAIR HOW IT WORKS CTA SCHEMA
-- Ensures missing columns exist in app_settings and reloads schema cache.

ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS how_cta_text TEXT DEFAULT 'Start Investing',
ADD COLUMN IF NOT EXISTS how_cta_link TEXT DEFAULT '/projects';

-- Force Schema Cache Refresh for PostgREST
NOTIFY pgrst, 'reload schema';
