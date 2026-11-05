import { uploadToHostinger } from "./hostinger-api";

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

/** Signed URL of a section image, or null when none uploaded. */
export async function getSectionImageUrl(key: string): Promise<string | null> {
  return getCachedSectionUrl(key);
}

/** Upload (or replace) a section image. Returns an error message or null. */
export async function uploadSectionImage(key: string, file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return "Please choose an image file (PNG, JPG or WebP)";
  if (file.size > 8 * 1024 * 1024) return "Image must be smaller than 8 MB";

  try {
    const res = await uploadToHostinger(file, "sections", key);
    if (res?.url) {
      setCachedSectionUrl(key, res.url);
      return null;
    }
  } catch {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCachedSectionUrl(key, reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  return null;
}

/** Remove a section image. Returns an error message or null. */
export async function deleteSectionImage(key: string): Promise<string | null> {
  setCachedSectionUrl(key, null);
  return null;
}
