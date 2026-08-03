// Cloud-storage backed brand logo (site-media/branding).
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "site-media";
const FOLDER = "branding";
const SIGNED_TTL = 60 * 60 * 24 * 365; // 1 year

async function currentFileName(): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, { limit: 100 });
  if (error || !data) return null;
  const file = data.find((f) => f.name.startsWith("logo."));
  return file ? file.name : null;
}

/** Signed URL of the brand logo, or null when none uploaded. */
export async function getLogoUrl(): Promise<string | null> {
  const name = await currentFileName();
  if (!name) return null;
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(`${FOLDER}/${name}`, SIGNED_TTL);
  return data?.signedUrl ?? null;
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
