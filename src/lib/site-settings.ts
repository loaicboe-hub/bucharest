// Site-wide company settings stored in localStorage + Hostinger MySQL + Supabase if configured.
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { apiSettings } from "./hostinger-api";

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
  companyName: "BucharestEgyAgro Import and Export",
  phone: "+20 107 003 3892",
  email: "info@bucharestegyagro.com",
  whatsapp: "+20 107 003 3892",
  address: "Cairo, Egypt",
  maps: "https://maps.google.com/?q=Cairo",
  facebook: "https://facebook.com/bucharestegyagro",
  instagram: "https://instagram.com/bucharestegyagro",
  linkedin: "https://linkedin.com/company/bucharestegyagro",
  twitter: "",
  seoTitle: "BucharestEgyAgro Import and Export | Premium Fresh Fruits & Vegetables Exporter",
  seoDescription:
    "BucharestEgyAgro Import and Export is a leading exporter of premium fresh fruits and vegetables since 2026. Premium certified quality.",
  seoKeywords: "Fresh Fruits Export, Fresh Vegetables Export, Egypt Export, Premium Produce, BucharestEgyAgro",
  seoOgImage: "",
};

const SETTINGS_KEY = "app_site_settings";

export async function loadSiteSettings(): Promise<SiteSettings> {
  let cached: SiteSettings | null = null;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) cached = JSON.parse(raw);
    } catch {}
  }

  // 1. Try Hostinger MySQL API
  try {
    const remote = await apiSettings.get();
    if (remote && (remote.companyName || remote.company_name || remote.phone !== undefined || remote.whatsapp !== undefined)) {
      const loaded: SiteSettings = {
        companyName: remote.companyName || remote.company_name || defaultSiteSettings.companyName,
        phone: remote.phone !== undefined && remote.phone !== "" ? remote.phone : defaultSiteSettings.phone,
        email: remote.email !== undefined && remote.email !== "" ? remote.email : defaultSiteSettings.email,
        whatsapp: remote.whatsapp !== undefined && remote.whatsapp !== "" ? remote.whatsapp : defaultSiteSettings.whatsapp,
        address: remote.address !== undefined && remote.address !== "" ? remote.address : defaultSiteSettings.address,
        maps: remote.maps || remote.maps_url || defaultSiteSettings.maps,
        facebook: remote.facebook || defaultSiteSettings.facebook,
        instagram: remote.instagram || defaultSiteSettings.instagram,
        linkedin: remote.linkedin || defaultSiteSettings.linkedin,
        twitter: remote.twitter || defaultSiteSettings.twitter,
        seoTitle: remote.seoTitle || remote.seo_title || defaultSiteSettings.seoTitle,
        seoDescription: remote.seoDescription || remote.seo_description || defaultSiteSettings.seoDescription,
        seoKeywords: remote.seoKeywords || remote.seo_keywords || defaultSiteSettings.seoKeywords,
        seoOgImage: remote.seoOgImage || remote.seo_og_image || "",
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(loaded));
      }
      return loaded;
    }
  } catch {
    /* fallback to local / Supabase */
  }

  // 2. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "default")
        .maybeSingle();

      if (!error && data) {
        const loaded: SiteSettings = {
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
        if (typeof window !== "undefined") {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(loaded));
        }
        return loaded;
      }
    } catch {}
  }

  return cached || defaultSiteSettings;
}

export async function saveSiteSettings(s: SiteSettings): Promise<string | null> {
  // Always persist locally in browser
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    } catch {}
  }

  // 1. Try Hostinger MySQL API
  try {
    await apiSettings.save({
      companyName: s.companyName,
      company_name: s.companyName,
      phone: s.phone,
      email: s.email,
      whatsapp: s.whatsapp,
      address: s.address,
      maps: s.maps,
      maps_url: s.maps,
      facebook: s.facebook,
      instagram: s.instagram,
      linkedin: s.linkedin,
      twitter: s.twitter,
      seoTitle: s.seoTitle,
      seo_title: s.seoTitle,
      seoDescription: s.seoDescription,
      seo_description: s.seoDescription,
      seoKeywords: s.seoKeywords,
      seo_keywords: s.seoKeywords,
      seoOgImage: s.seoOgImage,
      seo_og_image: s.seoOgImage,
    });
  } catch {
    /* fallback */
  }

  // 2. If Supabase configured
  if (isSupabaseConfigured()) {
    try {
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
    } catch (err: any) {
      return err?.message ?? null;
    }
  }

  return null;
}
