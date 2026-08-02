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
};

export const defaultSiteSettings: SiteSettings = {
  companyName: "Fresh Diamond for Export",
  phone: "+20 100 000 0000",
  email: "info@freshdiamond.com",
  whatsapp: "+20 100 000 0000",
  address: "Cairo, Egypt",
  maps: "https://maps.google.com/?q=Cairo",
  facebook: "https://facebook.com/freshdiamond",
  instagram: "https://instagram.com/freshdiamond",
  linkedin: "https://linkedin.com/company/freshdiamond",
  twitter: "",
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
  });
  return error?.message ?? null;
}
