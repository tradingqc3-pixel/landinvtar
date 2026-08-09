-- ============================================================
-- FINAL SUPABASE STORAGE BUCKET SETUP
-- ============================================================

-- 1. Create 'project-media' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'project-media',
    'project-media',
    true,
    10485760, -- 10MB
    '{"image/jpeg", "image/jpg", "image/png", "image/webp"}'
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = '{"image/jpeg", "image/jpg", "image/png", "image/webp"}';

-- 2. Create 'project-documents' bucket for legal files
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
    'project-documents',
    'project-documents',
    true,
    20971520 -- 20MB
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Clear existing conflicting policies for these buckets
DROP POLICY IF EXISTS "Public Access Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Manage Media" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Docs" ON storage.objects;
DROP POLICY IF EXISTS "Admin Manage Docs" ON storage.objects;

-- 4. Set up 'project-media' Policies
-- SELECT: Allow public read access
CREATE POLICY "Public Access Media"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-media');

-- ALL: Allow authenticated admins to manage files
CREATE POLICY "Admin Manage Media"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'project-media' AND
  (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'super_admin'))
  ))
)
WITH CHECK (
  bucket_id = 'project-media' AND
  (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'super_admin'))
  ))
);

-- 5. Set up 'project-documents' Policies
CREATE POLICY "Public Access Docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-documents');

CREATE POLICY "Admin Manage Docs"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'project-documents' AND
  (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'super_admin'))
  ))
)
WITH CHECK (
  bucket_id = 'project-documents' AND
  (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'super_admin'))
  ))
);

-- 6. Reload PostgREST to sync schema changes
NOTIFY pgrst, 'reload schema';
