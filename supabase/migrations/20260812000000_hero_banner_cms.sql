-- Create Hero Banner Table
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

-- Enable RLS
ALTER TABLE public.hero_banner ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Public read hero_banner"
ON public.hero_banner FOR SELECT
TO public
USING (true);

CREATE POLICY "Admin insert hero_banner"
ON public.hero_banner FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admin update hero_banner"
ON public.hero_banner FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Seed one default row
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
