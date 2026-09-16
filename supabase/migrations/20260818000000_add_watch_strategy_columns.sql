-- Add Watch Strategy columns to hero_banner
ALTER TABLE public.hero_banner
ADD COLUMN IF NOT EXISTS watch_button_text TEXT DEFAULT 'Watch Strategy',
ADD COLUMN IF NOT EXISTS watch_video_type TEXT DEFAULT 'youtube',
ADD COLUMN IF NOT EXISTS watch_video_url TEXT,
ADD COLUMN IF NOT EXISTS watch_thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS watch_enabled BOOLEAN DEFAULT false;

-- Force Schema Cache Refresh
NOTIFY pgrst, 'reload schema';
