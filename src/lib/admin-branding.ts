// Cloud-storage backed brand logo (site-media/branding).
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "site-media";
const FOLDER = "branding";
const SIGNED_TTL = 60 * 60 * 24 * 365; // 1 year
const CACHE_KEY = "nv_logo_cache_v2";
const CACHE_TTL = 1000 * 60 * 60 * 24 * 14; // re-check at most every 14 days
const MAX_INLINE_BYTES = 900_000; // keep localStorage well under quota

type LogoCache = { src: string | null; ts: number };

function readCache(): LogoCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as LogoCache) : null;
  } catch {
    return null;
  }
}

/** Last known logo (inlined data URL when possible) for an instant first paint. */
export function getCachedLogoUrl(): string | null {
  return readCache()?.src ?? null;
}

function setCachedLogoUrl(src: string | null) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ src, ts: Date.now() }));
  } catch {
    /* ignore quota errors */
  }
}

async function currentFileName(): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, { limit: 100 });
  if (error || !data) return null;
  const file = data.find((f) => f.name.startsWith("logo."));
  return file ? file.name : null;
}

async function toDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    if (blob.size > MAX_INLINE_BYTES) return null;
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Signed URL (or inlined data URL) of the brand logo, or null when none uploaded. */
export async function getLogoUrl(force = false): Promise<string | null> {
  const cached = readCache();
  if (!force && cached && Date.now() - cached.ts < CACHE_TTL) return cached.src;

  const name = await currentFileName();
  if (!name) {
    setCachedLogoUrl(null);
    return null;
  }
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(`${FOLDER}/${name}`, SIGNED_TTL);
  const url = data?.signedUrl ?? null;
  if (!url) return cached?.src ?? null;
  const inlined = (await toDataUrl(url)) ?? url;
  setCachedLogoUrl(inlined);
  return inlined;
}


/** Upload (or replace) the brand logo. Returns an error message or null. */
export async function uploadLogo(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return "Please choose an image file (PNG, JPG or SVG)";
  if (file.size > 1.5 * 1024 * 1024) return "Logo must be smaller than 1.5 MB";

  await deleteLogo();

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(`${FOLDER}/logo.${ext}`, file, { upsert: true, contentType: file.type });

  return error ? error.message : null;
}

/** Remove the stored brand logo. Returns an error message or null. */
export async function deleteLogo(): Promise<string | null> {
  const name = await currentFileName();
  if (!name) return null;
  const { error } = await supabase.storage.from(BUCKET).remove([`${FOLDER}/${name}`]);
  return error ? error.message : null;
}

/** Fetch the stored logo as a data URL (used for embedding in PDFs). */
export async function getLogoDataUrl(): Promise<string | null> {
  const url = await getLogoUrl();
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
