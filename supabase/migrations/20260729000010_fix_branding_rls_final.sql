-- ============================================================
-- FIX BRANDING SETTINGS RLS & STORAGE
-- ============================================================

-- 1. Create branding_settings table with strict schema
CREATE TABLE IF NOT EXISTS public.branding_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    logo_url TEXT DEFAULT '/logo.png',
    favicon_url TEXT DEFAULT '/logo.png',
    primary_color TEXT DEFAULT '#10b981',
    secondary_color TEXT DEFAULT '#f59e0b',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.branding_settings ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Admins can manage branding" ON public.branding_settings;
DROP POLICY IF EXISTS "Public can read branding" ON public.branding_settings;

-- 4. Create Admin Management Policy
CREATE POLICY "Admins can manage branding" ON public.branding_settings
    FOR ALL
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

-- 5. Create Public Read Policy
CREATE POLICY "Public can read branding" ON public.branding_settings
    FOR SELECT
    TO public
    USING (true);

-- 6. Initialize singleton record
-- Try to seed from existing app_settings if available
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'app_settings' AND table_schema = 'public') THEN
        INSERT INTO public.branding_settings (id, logo_url, favicon_url, primary_color, secondary_color)
        SELECT 1, logo_url, favicon_url, primary_color, secondary_color
        FROM public.app_settings
        LIMIT 1
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Ensure at least one record exists
    INSERT INTO public.branding_settings (id, logo_url, favicon_url)
    VALUES (1, '/logo.png', '/logo.png')
    ON CONFLICT (id) DO NOTHING;
END $$;

-- 7. Ensure Storage Bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 8. Storage Policies for 'branding' bucket
-- Drop old ones first
DROP POLICY IF EXISTS "Branding Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Branding Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Branding Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Branding Admin Delete" ON storage.objects;

CREATE POLICY "Branding Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'branding');

CREATE POLICY "Branding Admin Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'branding' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (role IN ('admin', 'super_admin') OR is_admin = true)
    )
);

CREATE POLICY "Branding Admin Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'branding' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (role IN ('admin', 'super_admin') OR is_admin = true)
    )
);

CREATE POLICY "Branding Admin Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'branding' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (role IN ('admin', 'super_admin') OR is_admin = true)
    )
);
