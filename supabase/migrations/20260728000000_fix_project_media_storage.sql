-- ============================================================
-- FIX PROJECT MEDIA STORAGE & POLICIES
-- ============================================================

-- 1. Ensure project-media bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-media', 'project-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage Policies for project-media
-- Remove any conflicting policies
DROP POLICY IF EXISTS "Public Access Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin All Media" ON storage.objects;

-- Allow public read access to all project media
CREATE POLICY "Public Access Media"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-media');

-- Allow admins to manage all project media
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

-- 3. Ensure land_projects table has correct media columns (standardizing)
-- We already have cover_image and gallery_images from previous migration.
-- Let's ensure they are updated for any rows that might still use 'image' or 'images'.
UPDATE public.land_projects
SET cover_image = image
WHERE (cover_image IS NULL OR cover_image = '') AND image IS NOT NULL AND image != '';

UPDATE public.land_projects
SET gallery_images = images
WHERE (gallery_images IS NULL OR array_length(gallery_images, 1) IS NULL) AND images IS NOT NULL AND array_length(images, 1) > 0;

NOTIFY pgrst, 'reload schema';
