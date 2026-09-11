-- Ensure land_projects has the required columns for featured assets and core metadata
ALTER TABLE public.land_projects
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_order INTEGER DEFAULT 0;

-- Optional: If the user explicitly wants 'title' and 'price' columns for consistency with other parts of their system
-- We can add them, but the current UI uses 'name' and 'min_investment'.
-- We'll add them as NULLABLE to avoid breaking existing inserts.
ALTER TABLE public.land_projects
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS price NUMERIC;

-- Sync title/price with name/min_investment for existing rows
UPDATE public.land_projects SET title = name WHERE title IS NULL;
UPDATE public.land_projects SET price = min_investment WHERE price IS NULL;
