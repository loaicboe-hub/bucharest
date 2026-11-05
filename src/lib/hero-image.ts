// Cloud-storage & Hostinger backed hero background image (site-media/hero).
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { uploadToHostinger } from "./hostinger-api";

const BUCKET = "site-media";
const FOLDER = "hero";
const SIGNED_TTL = 60 * 60 * 24 * 365; // 1 year
const CACHE_KEY = "nv_hero_image_cache_v1";

/** Last successfully loaded hero URL, used before the cloud lookup finishes. */
export function getCachedHeroImageUrl(): string | null {
  if (typeof window === "undefined") return "/kemet-eden-hero.jpg";
  try {
    return window.localStorage.getItem(CACHE_KEY) || "/kemet-eden-hero.jpg";
  } catch {
    return "/kemet-eden-hero.jpg";
  }
}

function setCachedHeroImageUrl(url: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (url) window.localStorage.setItem(CACHE_KEY, url);
    else window.localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore unavailable storage */
  }
}

async function currentFileName(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, { limit: 100 });
    if (error || !data) return null;
    const file = data.find((f) => f.name.startsWith("hero."));
    return file ? file.name : null;
  } catch {
    return null;
  }
}

/** Signed URL of the hero background image, or null when none uploaded. */
export async function getHeroImageUrl(): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return getCachedHeroImageUrl();
  }
  try {
    const name = await currentFileName();
    if (!name) return getCachedHeroImageUrl();
    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(`${FOLDER}/${name}`, SIGNED_TTL);
    const url = data?.signedUrl ?? null;
    if (url) setCachedHeroImageUrl(url);
    return url ?? getCachedHeroImageUrl();
  } catch {
    return getCachedHeroImageUrl();
  }
}

/** Upload (or replace) the hero background image. Returns an error message or null. */
export async function uploadHeroImage(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return "Please choose an image file (PNG, JPG or WebP)";
  if (file.size > 8 * 1024 * 1024) return "Image must be smaller than 8 MB";

  // 1. Try uploading to Hostinger backend
  try {
    const res = await uploadToHostinger(file, "hero", "hero");
    if (res?.url) {
      setCachedHeroImageUrl(res.url);
      return null;
    }
  } catch {
    // Offline local dev: save as data URL
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCachedHeroImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  // 2. If Supabase configured
  if (isSupabaseConfigured()) {
    try {
      await deleteHeroImage();
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(`${FOLDER}/hero.${ext}`, file, { upsert: true, contentType: file.type });
      return error ? error.message : null;
    } catch (err: any) {
      return err?.message || null;
    }
  }

  return null;
}

/** Remove the stored hero background image. Returns an error message or null. */
export async function deleteHeroImage(): Promise<string | null> {
  setCachedHeroImageUrl(null);
  if (!isSupabaseConfigured()) return null;
  try {
    const name = await currentFileName();
    if (!name) return null;
    const { error } = await supabase.storage.from(BUCKET).remove([`${FOLDER}/${name}`]);
    return error ? error.message : null;
  } catch {
    return null;
  }
}
