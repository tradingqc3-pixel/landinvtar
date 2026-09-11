-- ADD VIDEO CONTROL TO HOW IT WORKS CMS
-- Expands app_settings to manage video content on the instructional page.

ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS how_video_url TEXT DEFAULT 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
ADD COLUMN IF NOT EXISTS how_video_thumbnail TEXT DEFAULT 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?q=80&w=1000',
ADD COLUMN IF NOT EXISTS how_video_title TEXT DEFAULT 'The InvestLand Strategy',
ADD COLUMN IF NOT EXISTS how_video_description TEXT DEFAULT 'Watch how we select, verify, and fractionize premium land assets for you.',
ADD COLUMN IF NOT EXISTS how_video_autoplay BOOLEAN DEFAULT false;

-- Force Schema Cache Refresh
NOTIFY pgrst, 'reload schema';
