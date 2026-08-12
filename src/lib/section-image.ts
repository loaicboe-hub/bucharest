// Cloud-storage backed section images (site-media/sections/<key>.<ext>).
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "site-media";
const FOLDER = "sections";
const SIGNED_TTL = 60 * 60 * 24 * 365; // 1 year

async function currentFileName(key: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, { limit: 100 });
  if (error || !data) return null;
  const file = data.find((f) => f.name.startsWith(`${key}.`));
  return file ? file.name : null;
}

/** Signed URL of a section image, or null when none uploaded. */
export async function getSectionImageUrl(key: string): Promise<string | null> {
  const name = await currentFileName(key);
  if (!name) return null;
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(`${FOLDER}/${name}`, SIGNED_TTL);
  return data?.signedUrl ?? null;
}

/** Upload (or replace) a section image. Returns an error message or null. */
export async function uploadSectionImage(key: string, file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return "Please choose an image file (PNG, JPG or WebP)";
  if (file.size > 8 * 1024 * 1024) return "Image must be smaller than 8 MB";

  await deleteSectionImage(key);

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(`${FOLDER}/${key}.${ext}`, file, { upsert: true, contentType: file.type });

  return error ? error.message : null;
}

/** Remove a section image. Returns an error message or null. */
export async function deleteSectionImage(key: string): Promise<string | null> {
  const name = await currentFileName(key);
  if (!name) return null;
  const { error } = await supabase.storage.from(BUCKET).remove([`${FOLDER}/${name}`]);
  return error ? error.message : null;
}
