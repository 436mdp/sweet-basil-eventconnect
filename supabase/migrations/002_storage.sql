-- Storage bucket and policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  20971520,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read event images" ON storage.objects;
CREATE POLICY "Public read event images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

DROP POLICY IF EXISTS "Auth upload event images" ON storage.objects;
CREATE POLICY "Auth upload event images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-images'
  AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Auth update own uploads" ON storage.objects;
CREATE POLICY "Auth update own uploads"
ON storage.objects FOR UPDATE
USING (bucket_id = 'event-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage storage" ON storage.objects;
CREATE POLICY "Admin manage storage"
ON storage.objects FOR ALL
USING (bucket_id = 'event-images' AND public.is_admin());
