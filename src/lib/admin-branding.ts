// Brand logo backed by LocalStorage and Supabase.
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

const BUCKET = "site-media";
const FOLDER = "branding";
const SIGNED_TTL = 60 * 60 * 24 * 365; // 1 year
const CACHE_KEY = "nv_logo_cache_v3";
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

/** Last known logo for instant paint, defaults to /logo.png */
export function getCachedLogoUrl(): string | null {
  return readCache()?.src ?? "/logo.png";
}

/** Dynamically sync the browser tab favicon to match the brand logo */
export function updateFavicon(url?: string | null) {
  if (typeof document === "undefined") return;
  const targetHref = url || "/logo.png";
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    document.head.appendChild(link);
  }
  if (link.href !== targetHref) {
    link.href = targetHref;
  }
}

function setCachedLogoUrl(src: string | null) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ src, ts: Date.now() }));
    updateFavicon(src);
  } catch {
    /* ignore quota errors */
  }
}

async function currentFileName(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, { limit: 100 });
    if (error || !data) return null;
    const file = data.find((f) => f.name.startsWith("logo."));
    return file ? file.name : null;
  } catch {
    return null;
  }
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

/** Signed URL (or inlined data URL) of the brand logo, or /logo.png */
export async function getLogoUrl(force = false): Promise<string | null> {
  const cached = readCache();
  if (!force && cached && Date.now() - cached.ts < CACHE_TTL && cached.src) return cached.src;

  if (!isSupabaseConfigured()) {
    return cached?.src ?? "/logo.png";
  }

  try {
    const name = await currentFileName();
    if (!name) {
      return cached?.src ?? "/logo.png";
    }
    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(`${FOLDER}/${name}`, SIGNED_TTL);
    const url = data?.signedUrl ?? null;
    if (!url) return cached?.src ?? "/logo.png";
    const inlined = (await toDataUrl(url)) ?? url;
    setCachedLogoUrl(inlined);
    return inlined;
  } catch {
    return cached?.src ?? "/logo.png";
  }
}

/** Upload (or replace) the brand logo. */
export async function uploadLogo(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return "Please choose an image file (PNG, JPG or SVG)";
  if (file.size > 2 * 1024 * 1024) return "Logo must be smaller than 2 MB";

  const dataUrl = await readFileAsDataUrl(file);
  setCachedLogoUrl(dataUrl);

  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    await deleteLogo();
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(`${FOLDER}/logo.${ext}`, file, { upsert: true, contentType: file.type });
    return error ? error.message : null;
  } catch (err: any) {
    return null;
  }
}

/** Remove the stored brand logo. */
export async function deleteLogo(): Promise<string | null> {
  setCachedLogoUrl(null);
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

/** Fetch the stored logo as a data URL (used for embedding in PDFs). */
export async function getLogoDataUrl(): Promise<string | null> {
  const url = await getLogoUrl();
  if (!url) return null;
  if (url.startsWith("data:")) return url;

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
