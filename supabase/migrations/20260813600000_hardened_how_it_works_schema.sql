-- HARDENED HOW IT WORKS CMS SCHEMA
-- Ensures all required narrative and visual configuration columns exist in app_settings.

ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS how_hero_subtitle TEXT DEFAULT 'The Investment Loop',
ADD COLUMN IF NOT EXISTS how_hero_title TEXT DEFAULT 'Investment Simplified.',
ADD COLUMN IF NOT EXISTS how_hero_description TEXT DEFAULT 'We''ve broken down the barriers of traditional real estate. No middlemen, no bulky paperwork, no massive down-payments.',
ADD COLUMN IF NOT EXISTS how_hero_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?q=80&w=1000',
ADD COLUMN IF NOT EXISTS how_cta_text TEXT DEFAULT 'Start Investing',
ADD COLUMN IF NOT EXISTS how_cta_link TEXT DEFAULT '/projects';

-- Provide aliases/redundancy for requested specific names to prevent future schema cache misses
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS how_subtitle TEXT,
ADD COLUMN IF NOT EXISTS how_title TEXT,
ADD COLUMN IF NOT EXISTS how_image_url TEXT;

-- Sync data from hero-prefixed to non-prefixed if they were used
UPDATE public.app_settings SET
    how_subtitle = COALESCE(how_subtitle, how_hero_subtitle),
    how_title = COALESCE(how_title, how_hero_title),
    how_image_url = COALESCE(how_image_url, how_hero_image_url);

-- Force Schema Cache Refresh for PostgREST
NOTIFY pgrst, 'reload schema';
