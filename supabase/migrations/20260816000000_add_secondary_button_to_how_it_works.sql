-- ADD SECONDARY BUTTON AND BACKGROUND LAYOUT TO HOW IT WORKS SECTIONS
-- This ensures the CTA sections can have dual actions and immersive backgrounds.

ALTER TABLE public.how_it_works_sections
  ADD COLUMN IF NOT EXISTS secondary_button_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS secondary_button_text TEXT DEFAULT 'Learn More',
  ADD COLUMN IF NOT EXISTS secondary_button_link TEXT DEFAULT '#',
  ADD COLUMN IF NOT EXISTS show_secondary_button BOOLEAN NOT NULL DEFAULT FALSE;

-- Force Schema Cache Refresh
NOTIFY pgrst, 'reload schema';
