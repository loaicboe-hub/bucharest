-- 1) Partners: restrict management to admins
DROP POLICY IF EXISTS "Authenticated users manage partners" ON public.partners;
CREATE POLICY "Admins can insert partners" ON public.partners
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update partners" ON public.partners
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete partners" ON public.partners
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 2) Storage: narrow public read to site-wide public assets only
DROP POLICY IF EXISTS "Public can read published site media" ON storage.objects;
CREATE POLICY "Public can read published site media" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (
    bucket_id = 'site-media'
    AND (storage.foldername(name))[1] = ANY (ARRAY['branding','partners','about','hero'])
  );

-- 3) Bootstrap helper is no longer directly callable by signed-in users
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO service_role;