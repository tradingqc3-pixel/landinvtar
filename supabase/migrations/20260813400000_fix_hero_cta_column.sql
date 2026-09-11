-- INVESTLAND HERO BANNER CTA COLUMN REPAIR
-- Standardizes CTA path/link column naming and ensures schema synchronization.

-- 1. Handle potential column mismatch
DO $$
BEGIN
    -- If 'cta_path' exists but 'cta_link' does not, rename it
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hero_banner' AND column_name = 'cta_path' AND table_schema = 'public')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hero_banner' AND column_name = 'cta_link' AND table_schema = 'public') THEN
        ALTER TABLE public.hero_banner RENAME COLUMN cta_path TO cta_link;
    END IF;

    -- If 'cta_link' still doesn't exist, add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hero_banner' AND column_name = 'cta_link' AND table_schema = 'public') THEN
        ALTER TABLE public.hero_banner ADD COLUMN cta_link TEXT;
    END IF;
END $$;

-- 2. Force Schema Cache Refresh
NOTIFY pgrst, 'reload schema';
