-- ============================================================
-- STORAGE BUCKETS & KYC SCHEMA STANDARDIZATION
-- ============================================================

-- 1. Ensure Buckets Exist and are Public
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('project-media', 'project-media', true),
  ('project-documents', 'project-documents', true),
  ('kyc-documents', 'kyc-documents', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 2. Standardize kyc_documents table columns
DO $$
BEGIN
    -- Selfie column
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kyc_documents' AND column_name='selfie') THEN
        ALTER TABLE public.kyc_documents RENAME COLUMN selfie TO selfie_file_url;
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kyc_documents' AND column_name='selfie_url') THEN
        ALTER TABLE public.kyc_documents RENAME COLUMN selfie_url TO selfie_file_url;
    END IF;

    -- PAN image column
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kyc_documents' AND column_name='pan_image') THEN
        ALTER TABLE public.kyc_documents RENAME COLUMN pan_image TO pan_file_url;
    END IF;

    -- Aadhaar front column
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kyc_documents' AND column_name='aadhaar_front') THEN
        ALTER TABLE public.kyc_documents RENAME COLUMN aadhaar_front TO aadhaar_file_url;
    END IF;

    -- Aadhaar back column
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kyc_documents' AND column_name='aadhaar_back') THEN
        ALTER TABLE public.kyc_documents RENAME COLUMN aadhaar_back TO aadhaar_back_file_url;
    END IF;
END $$;

-- 3. Standardize land_projects media columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='land_projects' AND column_name='cover_image') THEN
        ALTER TABLE public.land_projects ADD COLUMN cover_image TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='land_projects' AND column_name='gallery_images') THEN
        ALTER TABLE public.land_projects ADD COLUMN gallery_images TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- 4. Storage Policies
-- Generic policy for public access to public buckets
CREATE POLICY "Public Select" ON storage.objects FOR SELECT USING (bucket_id IN ('project-media', 'project-documents', 'kyc-documents', 'avatars'));

-- Admin policy for management
CREATE POLICY "Admin All" ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id IN ('project-media', 'project-documents', 'kyc-documents', 'avatars') AND
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'super_admin'))))
);

-- User policy for own kyc-documents and avatars
CREATE POLICY "User Manage Own" ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id IN ('kyc-documents', 'avatars') AND
  (storage.foldername(name))[1] = auth.uid()::text
);

NOTIFY pgrst, 'reload schema';
