-- Rebuild SEO Settings Table with Requested Columns
DROP TABLE IF EXISTS public.seo_settings CASCADE;

CREATE TABLE public.seo_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    browser_title TEXT,
    meta_description TEXT,
    keywords TEXT,
    canonical_url TEXT,
    og_title TEXT,
    og_description TEXT,
    og_image TEXT,
    twitter_title TEXT,
    twitter_description TEXT,
    twitter_image TEXT,
    json_ld TEXT,
    google_analytics_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- Policies for Admins (assuming they are authenticated)
CREATE POLICY "Admins can select seo_settings"
ON public.seo_settings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert seo_settings"
ON public.seo_settings FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can update seo_settings"
ON public.seo_settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Public Read Access for the Website
CREATE POLICY "Public can read seo_settings"
ON public.seo_settings FOR SELECT
TO public
USING (true);

-- Insert one default row
INSERT INTO public.seo_settings (
    browser_title,
    meta_description,
    keywords,
    canonical_url
) VALUES (
    'InvestLand — Premium Fractional Land Investment',
    'Invest in premium land from ₹500. Secure, transparent, and high-yield real estate assets.',
    'land investment, fractional ownership, real estate India, InvestLand',
    'https://investland.app'
) ON CONFLICT DO NOTHING;

-- Trigger to notify PostgREST to reload schema cache (if supported)
NOTIFY pgrst, 'reload schema';
