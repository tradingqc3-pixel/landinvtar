-- ============================================================
-- DEFINITIVE RLS FIX FOR PROJECT STORAGE (MEDIA & DOCUMENTS)
-- ============================================================

-- 1. Ensure the is_admin function is robust and uses SECURITY DEFINER
-- Using SECURITY DEFINER bypasses RLS on the profiles table for this check.
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND (role IN ('admin', 'super_admin', 'Admin') OR is_admin = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO service_role;

-- 2. Drop existing policies to avoid conflicts for project buckets
DROP POLICY IF EXISTS "Public Access Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Manage Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin All Media" ON storage.objects;
DROP POLICY IF EXISTS "Public Select Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin manage media" ON storage.objects;
DROP POLICY IF EXISTS "project_media_public_select" ON storage.objects;
DROP POLICY IF EXISTS "project_media_admin_all" ON storage.objects;
DROP POLICY IF EXISTS "project_media_select" ON storage.objects;
DROP POLICY IF EXISTS "project_media_admin" ON storage.objects;

DROP POLICY IF EXISTS "Public Access Docs" ON storage.objects;
DROP POLICY IF EXISTS "Admin Manage Docs" ON storage.objects;
DROP POLICY IF EXISTS "Admin All Docs" ON storage.objects;
DROP POLICY IF EXISTS "Public Select Docs" ON storage.objects;
DROP POLICY IF EXISTS "project_docs_select" ON storage.objects;
DROP POLICY IF EXISTS "project_docs_admin" ON storage.objects;

-- 3. BUCKET: project-media
-- SELECT: Allow public read
CREATE POLICY "project_media_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-media');

-- ALL: Allow admins full access
CREATE POLICY "project_media_admin"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'project-media' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'project-media' AND public.is_admin(auth.uid()));

-- 4. BUCKET: project-documents
-- SELECT: Allow public read (or authenticated if you prefer privacy)
CREATE POLICY "project_docs_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-documents');

-- ALL: Allow admins full access
CREATE POLICY "project_docs_admin"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'project-documents' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'project-documents' AND public.is_admin(auth.uid()));

-- 5. Helper to reload schema cache
NOTIFY pgrst, 'reload schema';
