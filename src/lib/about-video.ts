import { uploadToHostinger } from "./hostinger-api";

const CACHE_KEY = "nv_about_video_cache_v1";

function getCachedVideoUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(CACHE_KEY);
  } catch {
    return null;
  }
}

function setCachedVideoUrl(url: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (url) localStorage.setItem(CACHE_KEY, url);
    else localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

/** Public URL of the About Us video, or null when none uploaded. */
export async function getAboutVideoUrl(): Promise<string | null> {
  return getCachedVideoUrl();
}

/** Upload (or replace) the About Us video. Returns an error message or null. */
export async function uploadAboutVideo(file: File): Promise<string | null> {
  if (!file.type.startsWith("video/")) return "Please choose an MP4 or WebM video file.";
  if (file.size > 50 * 1024 * 1024) return "Video is too large. Please keep it under 50 MB.";

  try {
    const res = await uploadToHostinger(file, "about", "video");
    if (res?.url) {
      setCachedVideoUrl(res.url);
      return null;
    }
  } catch {
    setCachedVideoUrl(URL.createObjectURL(file));
  }

  return null;
}

/** Remove the current About Us video. Returns an error message or null. */
export async function deleteAboutVideo(): Promise<string | null> {
  setCachedVideoUrl(null);
  return null;
}
