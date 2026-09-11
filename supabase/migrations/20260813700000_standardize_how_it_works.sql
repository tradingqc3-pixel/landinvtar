-- STANDARDIZE HOW IT WORKS CMS COLUMNS
-- This migration ensures app_settings has the exact field names expected by the synchronized CMS terminal.

ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS how_subtitle TEXT DEFAULT 'The Investment Loop',
ADD COLUMN IF NOT EXISTS how_title TEXT DEFAULT 'Investment Simplified.',
ADD COLUMN IF NOT EXISTS how_hero_description TEXT DEFAULT 'We''ve broken down the barriers of traditional real estate. No middlemen, no bulky paperwork, no massive down-payments.',
ADD COLUMN IF NOT EXISTS how_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?q=80&w=1000',
ADD COLUMN IF NOT EXISTS how_cta_text TEXT DEFAULT 'Start Investing',
ADD COLUMN IF NOT EXISTS how_cta_link TEXT DEFAULT '/projects';

-- Migrate data from older column names if they exist to prevent data loss
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'how_hero_subtitle') THEN
        UPDATE public.app_settings SET how_subtitle = how_hero_subtitle WHERE how_subtitle IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'how_hero_title') THEN
        UPDATE public.app_settings SET how_title = how_hero_title WHERE how_title IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'how_hero_image_url') THEN
        UPDATE public.app_settings SET how_image_url = how_hero_image_url WHERE how_image_url IS NULL;
    END IF;
END $$;

-- FORCE SCHEMA CACHE RELOAD
NOTIFY pgrst, 'reload schema';
