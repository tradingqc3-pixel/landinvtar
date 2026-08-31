-- ============================================================
-- FIX BRANDING STORAGE RLS POLICIES
-- ============================================================

-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Remove old conflicting policies
DROP POLICY IF EXISTS "Branding Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Branding Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Branding Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Branding Admin Delete" ON storage.objects;

-- 1. SELECT: Public users can read objects from bucket 'branding'
CREATE POLICY "Public Read Branding"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'branding');

-- 2. INSERT: Authenticated users can upload objects where bucket_id = 'branding'
CREATE POLICY "Authenticated Insert Branding"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'branding');

-- 3. UPDATE: Authenticated users can replace/update objects where bucket_id = 'branding'
CREATE POLICY "Authenticated Update Branding"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'branding')
WITH CHECK (bucket_id = 'branding');

-- 4. DELETE: Authenticated users can delete objects where bucket_id = 'branding'
CREATE POLICY "Authenticated Delete Branding"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'branding');
