// Site-wide company settings stored in localStorage + Hostinger MySQL.
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

  // Clear stale placeholder from cache
  if (cached && (cached.phone === "+20 100 000 0000" || cached.whatsapp === "+20 100 000 0000" || !cached.phone)) {
    cached.phone = "+20 107 003 3892";
    cached.whatsapp = "+20 107 003 3892";
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(cached));
      } catch {}
    }
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
    /* fallback to local */
  }

  return cached || defaultSiteSettings;
}

export async function saveSiteSettings(s: SiteSettings): Promise<string | null> {
  const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  // 1. Save to Hostinger MySQL API
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
  } catch (err: any) {
    if (!isLocal) return err?.message || "Failed to save settings to server.";
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    } catch {}
  }

  return null;
}
