-- Expand SEO Settings for comprehensive metadata
ALTER TABLE public.seo_settings
ADD COLUMN IF NOT EXISTS og_title TEXT,
ADD COLUMN IF NOT EXISTS og_description TEXT,
ADD COLUMN IF NOT EXISTS twitter_title TEXT,
ADD COLUMN IF NOT EXISTS twitter_description TEXT,
ADD COLUMN IF NOT EXISTS twitter_image TEXT,
ADD COLUMN IF NOT EXISTS twitter_card TEXT DEFAULT 'summary_large_image',
ADD COLUMN IF NOT EXISTS organization_schema JSONB DEFAULT '{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "InvestLand",
  "url": "https://investland.app",
  "logo": "https://investland.app/logo.png"
}'::jsonb;
