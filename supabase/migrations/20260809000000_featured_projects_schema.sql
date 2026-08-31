-- Add featured columns to land_projects
ALTER TABLE public.land_projects
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_order INTEGER;
