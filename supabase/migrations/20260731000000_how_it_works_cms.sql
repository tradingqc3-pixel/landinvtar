-- Extend app_settings for How It Works CMS
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS how_hero_title TEXT DEFAULT 'Investment Simplified.',
ADD COLUMN IF NOT EXISTS how_hero_subtitle TEXT DEFAULT 'The Investment Loop',
ADD COLUMN IF NOT EXISTS how_hero_description TEXT DEFAULT 'We''ve broken down the barriers of traditional real estate. No middlemen, no bulky paperwork, no massive down-payments.',
ADD COLUMN IF NOT EXISTS how_hero_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?q=80&w=1000',
ADD COLUMN IF NOT EXISTS how_cta_text TEXT DEFAULT 'Get Started Now',
ADD COLUMN IF NOT EXISTS how_video_text TEXT DEFAULT 'Watch Video',
ADD COLUMN IF NOT EXISTS how_video_url TEXT DEFAULT 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
ADD COLUMN IF NOT EXISTS how_video_type TEXT DEFAULT 'youtube' CHECK (how_video_type IN ('youtube', 'mp4'));
