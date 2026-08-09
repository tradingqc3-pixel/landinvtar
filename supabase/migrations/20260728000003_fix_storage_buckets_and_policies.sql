-- ============================================================
-- FIX STORAGE BUCKETS & POLICIES
-- ============================================================

-- 1. Ensure Buckets Exist and are Public
-- Using standard naming: project-media, project-documents, kyc-documents
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('project-media', 'project-media', true),
  ('project-documents', 'project-documents', true),
  ('kyc-documents', 'kyc-documents', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage Policies for project-media
DROP POLICY IF EXISTS "Public Access Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Manage Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin All" ON storage.objects;

CREATE POLICY "Public Access Media" ON storage.objects FOR SELECT USING (bucket_id = 'project-media');

CREATE POLICY "Admin Manage Media" ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'project-media' AND
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'super_admin'))))
);

-- 3. Storage Policies for project-documents
DROP POLICY IF EXISTS "Public Access Docs" ON storage.objects;
DROP POLICY IF EXISTS "Admin Manage Docs" ON storage.objects;

CREATE POLICY "Public Access Docs" ON storage.objects FOR SELECT USING (bucket_id = 'project-documents');

CREATE POLICY "Admin Manage Docs" ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'project-documents' AND
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'super_admin'))))
);

-- 4. Storage Policies for kyc-documents (User folder isolation)
DROP POLICY IF EXISTS "Users can upload own KYC" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own KYC" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all KYC" ON storage.objects;
DROP POLICY IF EXISTS "KYC visibility" ON storage.objects;

CREATE POLICY "Users can upload own KYC" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own KYC" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can view all KYC" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'super_admin'))))
);

CREATE POLICY "Admins can manage all KYC" ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'super_admin'))))
);

-- 5. Storage Policies for avatars
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage own avatar" ON storage.objects;

CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can manage own avatar" ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

NOTIFY pgrst, 'reload schema';
