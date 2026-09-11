-- DEFINITIVE HOW IT WORKS SECTIONS SYNC
-- Run this in the Supabase SQL Editor to ensure the table and data exist.

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.how_it_works_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  section_name TEXT NOT NULL DEFAULT 'New Section',

  subtitle TEXT DEFAULT '',
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',

  image_url TEXT DEFAULT '',
  image_alt TEXT DEFAULT '',

  button_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  button_text TEXT DEFAULT '',
  button_link TEXT DEFAULT '',

  video_button_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  video_button_text TEXT DEFAULT 'Watch Video',
  video_url TEXT DEFAULT '',
  video_type TEXT DEFAULT 'youtube',
  video_thumbnail TEXT DEFAULT '',
  video_open_mode TEXT DEFAULT 'modal',

  layout TEXT NOT NULL DEFAULT 'image-left',
  text_alignment TEXT NOT NULL DEFAULT 'left',

  background_type TEXT NOT NULL DEFAULT 'default',
  background_color TEXT DEFAULT '',

  show_image BOOLEAN NOT NULL DEFAULT TRUE,
  show_button BOOLEAN NOT NULL DEFAULT FALSE,
  show_video_button BOOLEAN NOT NULL DEFAULT FALSE,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_how_it_works_sections_sort_order
ON public.how_it_works_sections(sort_order);

CREATE INDEX IF NOT EXISTS idx_how_it_works_sections_active
ON public.how_it_works_sections(is_active);

-- 3. RLS
ALTER TABLE public.how_it_works_sections ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
DROP POLICY IF EXISTS "Public read how_it_works_sections" ON public.how_it_works_sections;
CREATE POLICY "Public read how_it_works_sections"
ON public.how_it_works_sections FOR SELECT
TO public
USING (is_active = true);

-- Policy for admin write access
DROP POLICY IF EXISTS "Admin manage how_it_works_sections" ON public.how_it_works_sections;
CREATE POLICY "Admin manage how_it_works_sections"
ON public.how_it_works_sections FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role IN ('admin', 'super_admin') OR is_admin = true)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role IN ('admin', 'super_admin') OR is_admin = true)
  )
);

-- 4. Initial Starter Data
INSERT INTO public.how_it_works_sections (section_name, subtitle, title, description, sort_order, is_active)
SELECT 'How It Works', 'SIMPLE. TRANSPARENT. ACCESSIBLE.', 'Invest in Land, Made Simple', 'Discover opportunities, review project details, and manage your investment from one place.', 0, true
WHERE NOT EXISTS (SELECT 1 FROM public.how_it_works_sections WHERE section_name = 'How It Works');

INSERT INTO public.how_it_works_sections (section_name, subtitle, title, description, sort_order, is_active)
SELECT 'Discover', 'EXPLORE OPPORTUNITIES', 'Find the Right Land Project', 'Browse available land projects and review location, pricing, and project information.', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.how_it_works_sections WHERE section_name = 'Discover');

INSERT INTO public.how_it_works_sections (section_name, subtitle, title, description, sort_order, is_active)
SELECT 'Invest', 'START INVESTING', 'Choose Your Investment', 'Select an opportunity that matches your goals and complete the investment securely.', 2, true
WHERE NOT EXISTS (SELECT 1 FROM public.how_it_works_sections WHERE section_name = 'Invest');

INSERT INTO public.how_it_works_sections (section_name, subtitle, title, description, sort_order, is_active)
SELECT 'Track', 'STAY INFORMED', 'Track Your Investment', 'Follow your investment and receive important project updates from your account.', 3, true
WHERE NOT EXISTS (SELECT 1 FROM public.how_it_works_sections WHERE section_name = 'Track');

-- 5. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION update_how_it_works_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_how_it_works_sections_updated ON public.how_it_works_sections;
CREATE TRIGGER on_how_it_works_sections_updated
  BEFORE UPDATE ON public.how_it_works_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_how_it_works_sections_updated_at();

-- 6. Schema Cache Reload
NOTIFY pgrst, 'reload schema';
