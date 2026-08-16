// Site-wide company settings stored in the backend (site_settings table).
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  companyName: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  maps: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoOgImage: string;
};

export const defaultSiteSettings: SiteSettings = {
  companyName: "Nailvlora Import and Export",
  phone: "+20 100 000 0000",
  email: "info@nailvlora.com",
  whatsapp: "+20 100 000 0000",
  address: "Cairo, Egypt",
  maps: "https://maps.google.com/?q=Cairo",
  facebook: "https://facebook.com/nailvlora",
  instagram: "https://instagram.com/nailvlora",
  linkedin: "https://linkedin.com/company/nailvlora",
  twitter: "",
  seoTitle: "Nailvlora Import and Export | Premium Fresh Fruits & Vegetables Exporter",
  seoDescription:
    "Nailvlora Import and Export is a leading exporter of premium fresh fruits and vegetables since 2026. Premium certified quality.",
  seoKeywords: "Fresh Fruits Export, Fresh Vegetables Export, Egypt Export, Premium Produce",
  seoOgImage: "",
};

export async function loadSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error || !data) return defaultSiteSettings;

  return {
    companyName: data.company_name,
    phone: data.phone,
    email: data.email,
    whatsapp: data.whatsapp,
    address: data.address,
    maps: data.maps_url,
    facebook: data.facebook,
    instagram: data.instagram,
    linkedin: data.linkedin,
    twitter: data.twitter,
    seoTitle: data.seo_title || defaultSiteSettings.seoTitle,
    seoDescription: data.seo_description || defaultSiteSettings.seoDescription,
    seoKeywords: data.seo_keywords || defaultSiteSettings.seoKeywords,
    seoOgImage: data.seo_og_image,
  };
}

export async function saveSiteSettings(s: SiteSettings): Promise<string | null> {
  const { error } = await supabase.from("site_settings").upsert({
    id: "default",
    company_name: s.companyName,
    phone: s.phone,
    email: s.email,
    whatsapp: s.whatsapp,
    address: s.address,
    maps_url: s.maps,
    facebook: s.facebook,
    instagram: s.instagram,
    linkedin: s.linkedin,
    twitter: s.twitter,
    seo_title: s.seoTitle,
    seo_description: s.seoDescription,
    seo_keywords: s.seoKeywords,
    seo_og_image: s.seoOgImage,
  });
  return error?.message ?? null;
}
