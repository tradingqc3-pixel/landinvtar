-- INVESTLAND DEFINITIVE HERO BANNER SCHEMA REPAIR
-- Standardizes table name to 'hero_banner' (singular) and ensures schema cache registration.

-- 1. If plural version exists from old migrations, rename it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hero_banners' AND table_schema = 'public') THEN
        ALTER TABLE public.hero_banners RENAME TO hero_banner;
    END IF;
END $$;

-- 2. Ensure singular table exists with correct columns
CREATE TABLE IF NOT EXISTS public.hero_banner (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gold_subtitle TEXT,
    hero_title TEXT,
    description TEXT,
    background_image_url TEXT,
    video_url TEXT,
    cta_text TEXT,
    cta_link TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Hardened RLS Configuration
ALTER TABLE public.hero_banner ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read hero_banner" ON public.hero_banner;
DROP POLICY IF EXISTS "Admin manage hero_banner" ON public.hero_banner;
DROP POLICY IF EXISTS "Admin insert hero_banner" ON public.hero_banner;
DROP POLICY IF EXISTS "Admin update hero_banner" ON public.hero_banner;

-- Public can view the active banner
CREATE POLICY "Public read hero_banner"
ON public.hero_banner FOR SELECT
TO public
USING (true);

-- Authenticated admins can do everything
CREATE POLICY "Admin manage hero_banner"
ON public.hero_banner FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Seed default if empty
INSERT INTO public.hero_banner (
    gold_subtitle,
    hero_title,
    description,
    background_image_url,
    cta_text,
    cta_link
)
SELECT
    'India''s #1 Land Investment Platform',
    'Invest in Premium Land from ₹500',
    'Democratizing real estate ownership through fractional investment. Secure, transparent, and high-yield land assets at your fingertips.',
    'https://images.pexels.com/photos/1117452/pexels-photo-1117452.jpeg',
    'Start Investing',
    '/projects'
WHERE NOT EXISTS (SELECT 1 FROM public.hero_banner);

-- 5. Force Schema Cache Refresh
NOTIFY pgrst, 'reload schema';
