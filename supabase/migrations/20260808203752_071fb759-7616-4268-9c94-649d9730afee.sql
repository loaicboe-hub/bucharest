-- Restrict public media reads to the known public asset folders only
DROP POLICY IF EXISTS "Public can read site media" ON storage.objects;
CREATE POLICY "Public can read published site media"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'site-media'
  AND (storage.foldername(name))[1] IN ('branding','partners','news','about','products')
);
CREATE POLICY "Admins can read all site media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Lock down SECURITY DEFINER function execution
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;