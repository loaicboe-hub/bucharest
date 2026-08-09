// Cloud-storage backed hero background image (site-media/hero).
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "site-media";
const FOLDER = "hero";
const SIGNED_TTL = 60 * 60 * 24 * 365; // 1 year

async function currentFileName(): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, { limit: 100 });
  if (error || !data) return null;
  const file = data.find((f) => f.name.startsWith("hero."));
  return file ? file.name : null;
}

/** Signed URL of the hero background image, or null when none uploaded. */
export async function getHeroImageUrl(): Promise<string | null> {
  const name = await currentFileName();
  if (!name) return null;
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(`${FOLDER}/${name}`, SIGNED_TTL);
  return data?.signedUrl ?? null;
}

/** Upload (or replace) the hero background image. Returns an error message or null. */
export async function uploadHeroImage(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return "Please choose an image file (PNG, JPG or WebP)";
  if (file.size > 8 * 1024 * 1024) return "Image must be smaller than 8 MB";

  await deleteHeroImage();

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(`${FOLDER}/hero.${ext}`, file, { upsert: true, contentType: file.type });

  return error ? error.message : null;
}

/** Remove the stored hero background image. Returns an error message or null. */
export async function deleteHeroImage(): Promise<string | null> {
  const name = await currentFileName();
  if (!name) return null;
  const { error } = await supabase.storage.from(BUCKET).remove([`${FOLDER}/${name}`]);
  return error ? error.message : null;
}
