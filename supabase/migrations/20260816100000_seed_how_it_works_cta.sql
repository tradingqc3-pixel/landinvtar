-- SEED THE FINAL CTA SECTION FOR HOW IT WORKS
-- This adds the immersive "Ready to build your Estate?" section as a dynamic node.

INSERT INTO public.how_it_works_sections (
  section_name,
  subtitle,
  title,
  description,
  layout,
  text_alignment,
  background_type,
  background_color,
  button_enabled,
  button_text,
  button_link,
  show_button,
  secondary_button_enabled,
  secondary_button_text,
  secondary_button_link,
  show_secondary_button,
  sort_order,
  is_active
)
SELECT
  'Final CTA',
  'IMMERSIVE OPPORTUNITY',
  'Ready to build your Estate?',
  'Join 12,000+ smart investors and start your fractional journey today. High-yield, secure, and fully transparent land assets.',
  'background',
  'center',
  'custom',
  '#059669',
  true,
  'Create Free Account',
  '/register',
  true,
  true,
  'Browse Assets',
  '/projects',
  true,
  10,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.how_it_works_sections WHERE section_name = 'Final CTA');

-- Update sort orders to ensure it stays at bottom
UPDATE public.how_it_works_sections SET sort_order = 10 WHERE section_name = 'Final CTA';
