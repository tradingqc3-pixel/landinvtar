-- REBUILD: HOW IT WORKS SECTIONS SYSTEM
-- Consolidated definitive migration.

-- 1. DROP OLD TABLE IF EXISTS TO ENSURE CLEAN STATE
DROP TABLE IF EXISTS public.how_it_works_sections;

-- 2. CREATE TABLE
CREATE TABLE public.how_it_works_sections (
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

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_how_it_works_sections_sort_order
ON public.how_it_works_sections(sort_order);

CREATE INDEX IF NOT EXISTS idx_how_it_works_sections_active
ON public.how_it_works_sections(is_active);

-- 4. UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_how_it_works_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_how_it_works_sections_updated_at
    BEFORE UPDATE ON public.how_it_works_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_how_it_works_sections_updated_at();

-- 5. RLS
ALTER TABLE public.how_it_works_sections ENABLE ROW LEVEL SECURITY;

-- Public read access for active sections
DROP POLICY IF EXISTS "Public read how_it_works_sections" ON public.how_it_works_sections;
CREATE POLICY "Public read how_it_works_sections"
ON public.how_it_works_sections FOR SELECT
TO public
USING (is_active = true);

-- Admin write access
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

-- 6. INSERT INITIAL CONTENT
INSERT INTO public.how_it_works_sections (section_name, subtitle, title, description, sort_order, is_active)
VALUES
('How It Works', 'SIMPLE. TRANSPARENT. ACCESSIBLE.', 'Invest in Land, Made Simple', 'Discover opportunities, review project details, complete your investment, and track everything from one place.', 0, true),
('Discover', 'EXPLORE OPPORTUNITIES', 'Find the Right Land Project', 'Browse available land projects and review location, pricing, development details, and investment information.', 1, true),
('Invest', 'START WITH CONFIDENCE', 'Choose Your Investment', 'Select the opportunity that matches your goals and complete the investment securely.', 2, true),
('Track', 'STAY INFORMED', 'Track Your Investment', 'Monitor your investments, project updates, and important information from your account.', 3, true);

-- 7. SCHEMA CACHE RELOAD
NOTIFY pgrst, 'reload schema';
