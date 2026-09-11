-- Final check and ensure featured columns exist on land_projects
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='land_projects' AND column_name='is_featured') THEN
        ALTER TABLE public.land_projects ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='land_projects' AND column_name='featured_order') THEN
        ALTER TABLE public.land_projects ADD COLUMN featured_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- Update RLS if necessary (already should be public read)
CREATE POLICY "Enable read access for all users on featured columns"
ON public.land_projects FOR SELECT
USING (true);
