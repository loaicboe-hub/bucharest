import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { uploadToHostinger } from "./hostinger-api";

const BUCKET = "site-media";
const FOLDER = "about";
const SIGNED_TTL = 60 * 60 * 24 * 365; // 1 year
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

async function currentFileName(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, { limit: 100 });
    if (error || !data) return null;
    const file = data.find((f) => f.name.startsWith("video."));
    return file ? file.name : null;
  } catch {
    return null;
  }
}

/** Public URL (signed) of the About Us video, or null when none uploaded. */
export async function getAboutVideoUrl(): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return getCachedVideoUrl();
  }
  try {
    const name = await currentFileName();
    if (!name) return getCachedVideoUrl();
    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(`${FOLDER}/${name}`, SIGNED_TTL);
    const url = data?.signedUrl ?? null;
    if (url) setCachedVideoUrl(url);
    return url ?? getCachedVideoUrl();
  } catch {
    return getCachedVideoUrl();
  }
}

/** Upload (or replace) the About Us video. Returns an error message or null. */
export async function uploadAboutVideo(file: File): Promise<string | null> {
  if (!file.type.startsWith("video/")) return "Please choose an MP4 or WebM video file.";
  if (file.size > 50 * 1024 * 1024) return "Video is too large. Please keep it under 50 MB.";

  // 1. Try uploading to Hostinger backend
  try {
    const res = await uploadToHostinger(file, "about", "video");
    if (res?.url) {
      setCachedVideoUrl(res.url);
      return null;
    }
  } catch {
    // Local dev: object URL
    setCachedVideoUrl(URL.createObjectURL(file));
  }

  // 2. If Supabase configured
  if (isSupabaseConfigured()) {
    try {
      await deleteAboutVideo();
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(`${FOLDER}/video.${ext}`, file, { upsert: true, contentType: file.type });
      return error ? error.message : null;
    } catch (err: any) {
      return err?.message || null;
    }
  }

  return null;
}

/** Remove the current About Us video. Returns an error message or null. */
export async function deleteAboutVideo(): Promise<string | null> {
  setCachedVideoUrl(null);
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
