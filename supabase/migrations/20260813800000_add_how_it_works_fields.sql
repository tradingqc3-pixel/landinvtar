ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS how_subtitle TEXT,
ADD COLUMN IF NOT EXISTS how_title TEXT,
ADD COLUMN IF NOT EXISTS how_hero_description TEXT,
ADD COLUMN IF NOT EXISTS how_image_url TEXT,
ADD COLUMN IF NOT EXISTS how_cta_text TEXT DEFAULT 'Start Investing',
ADD COLUMN IF NOT EXISTS how_cta_link TEXT DEFAULT '/projects';

NOTIFY pgrst, 'reload schema';
