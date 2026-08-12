DROP POLICY IF EXISTS "Public can read published site media" ON storage.objects;
CREATE POLICY "Public can read published site media" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'site-media' AND (storage.foldername(name))[1] = ANY (ARRAY['branding','partners','about','hero','sections']));