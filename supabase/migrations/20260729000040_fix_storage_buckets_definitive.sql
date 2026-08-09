-- ============================================================
-- DEFINITIVE STORAGE BUCKET FIX
-- ============================================================

-- 1. Ensure project-media bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-media', 'project-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Ensure project-documents bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-documents', 'project-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Storage Policies for project-media
DROP POLICY IF EXISTS "Public Access Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Manage Media" ON storage.objects;

CREATE POLICY "Public Access Media"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-media');

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

-- 4. Storage Policies for project-documents
DROP POLICY IF EXISTS "Public Access Docs" ON storage.objects;
DROP POLICY IF EXISTS "Admin Manage Docs" ON storage.objects;

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

-- 5. Helper to reload schema
NOTIFY pgrst, 'reload schema';
