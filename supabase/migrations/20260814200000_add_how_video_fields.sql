-- ADD VIDEO CONTROL FIELDS TO APP_SETTINGS
-- Ensures the How It Works CMS has the necessary database columns for video management.

ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS how_video_url TEXT,
  ADD COLUMN IF NOT EXISTS how_video_thumbnail TEXT,
  ADD COLUMN IF NOT EXISTS how_video_title TEXT,
  ADD COLUMN IF NOT EXISTS how_video_description TEXT,
  ADD COLUMN IF NOT EXISTS how_video_autoplay BOOLEAN DEFAULT FALSE;

-- FORCE SCHEMA CACHE RELOAD
NOTIFY pgrst, 'reload schema';
