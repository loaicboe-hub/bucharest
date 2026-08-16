UPDATE public.site_settings SET
  seo_description = replace(replace(coalesce(seo_description,''), ' ISO 9001 Certified.', ''), 'ISO 9001', 'Premium Quality'),
  seo_keywords = replace(replace(coalesce(seo_keywords,''), ', ISO 9001', ''), 'ISO 9001', 'Premium Produce'),
  seo_title = replace(coalesce(seo_title,''), 'ISO 9001', 'Premium Quality'),
  company_name = replace(coalesce(company_name,''), 'ISO 9001', '')
WHERE (coalesce(seo_title,'')||coalesce(seo_description,'')||coalesce(seo_keywords,'')||coalesce(company_name,'')) ILIKE '%9001%';