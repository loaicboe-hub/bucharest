import { uploadToHostinger } from "./hostinger-api";

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

/** Signed URL of the hero background image, or null when none uploaded. */
export async function getHeroImageUrl(): Promise<string | null> {
  return getCachedHeroImageUrl();
}

/** Upload (or replace) the hero background image. Returns an error message or null. */
export async function uploadHeroImage(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return "Please choose an image file (PNG, JPG or WebP)";
  if (file.size > 8 * 1024 * 1024) return "Image must be smaller than 8 MB";

  try {
    const res = await uploadToHostinger(file, "hero", "hero");
    if (res?.url) {
      setCachedHeroImageUrl(res.url);
      return null;
    }
  } catch {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCachedHeroImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  return null;
}

/** Remove the stored hero background image. Returns an error message or null. */
export async function deleteHeroImage(): Promise<string | null> {
  setCachedHeroImageUrl(null);
  return null;
}
