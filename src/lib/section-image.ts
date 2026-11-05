// Cloud-storage & Hostinger backed section images (site-media/sections/<key>.<ext>).
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { uploadToHostinger } from "./hostinger-api";

const BUCKET = "site-media";
const FOLDER = "sections";
const SIGNED_TTL = 60 * 60 * 24 * 365; // 1 year
const CACHE_KEY_PREFIX = "nv_section_image_";

function getCachedSectionUrl(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(`${CACHE_KEY_PREFIX}${key}`);
  } catch {
    return null;
  }
}

function setCachedSectionUrl(key: string, url: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (url) localStorage.setItem(`${CACHE_KEY_PREFIX}${key}`, url);
    else localStorage.removeItem(`${CACHE_KEY_PREFIX}${key}`);
  } catch {
    /* ignore */
  }
}

async function currentFileName(key: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, { limit: 100 });
    if (error || !data) return null;
    const file = data.find((f) => f.name.startsWith(`${key}.`));
    return file ? file.name : null;
  } catch {
    return null;
  }
}

/** Signed URL of a section image, or null when none uploaded. */
export async function getSectionImageUrl(key: string): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return getCachedSectionUrl(key);
  }
  try {
    const name = await currentFileName(key);
    if (!name) return getCachedSectionUrl(key);
    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(`${FOLDER}/${name}`, SIGNED_TTL);
    const url = data?.signedUrl ?? null;
    if (url) setCachedSectionUrl(key, url);
    return url ?? getCachedSectionUrl(key);
  } catch {
    return getCachedSectionUrl(key);
  }
}

/** Upload (or replace) a section image. Returns an error message or null. */
export async function uploadSectionImage(key: string, file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return "Please choose an image file (PNG, JPG or WebP)";
  if (file.size > 8 * 1024 * 1024) return "Image must be smaller than 8 MB";

  // 1. Try uploading to Hostinger backend
  try {
    const res = await uploadToHostinger(file, "sections", key);
    if (res?.url) {
      setCachedSectionUrl(key, res.url);
      return null;
    }
  } catch {
    // Local dev: convert to base64 data URL
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCachedSectionUrl(key, reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  // 2. If Supabase configured
  if (isSupabaseConfigured()) {
    try {
      await deleteSectionImage(key);
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(`${FOLDER}/${key}.${ext}`, file, { upsert: true, contentType: file.type });
      return error ? error.message : null;
    } catch (err: any) {
      return err?.message || null;
    }
  }

  return null;
}

/** Remove a section image. Returns an error message or null. */
export async function deleteSectionImage(key: string): Promise<string | null> {
  setCachedSectionUrl(key, null);
  if (!isSupabaseConfigured()) return null;
  try {
    const name = await currentFileName(key);
    if (!name) return null;
    const { error } = await supabase.storage.from(BUCKET).remove([`${FOLDER}/${name}`]);
    return error ? error.message : null;
  } catch {
    return null;
  }
}
