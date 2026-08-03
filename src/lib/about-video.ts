import { supabase } from "@/integrations/supabase/client";

const BUCKET = "site-media";
const FOLDER = "about";
const SIGNED_TTL = 60 * 60 * 24 * 365; // 1 year

async function currentFileName(): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, { limit: 100 });
  if (error || !data) return null;
  const file = data.find((f) => f.name.startsWith("video."));
  return file ? file.name : null;
}

/** Public URL (signed) of the About Us video, or null when none uploaded. */
export async function getAboutVideoUrl(): Promise<string | null> {
  const name = await currentFileName();
  if (!name) return null;
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(`${FOLDER}/${name}`, SIGNED_TTL);
  return data?.signedUrl ?? null;
}

/** Upload (or replace) the About Us video. Returns an error message or null. */
export async function uploadAboutVideo(file: File): Promise<string | null> {
  if (!file.type.startsWith("video/")) return "Please choose an MP4 or WebM video file.";
  if (file.size > 50 * 1024 * 1024) return "Video is too large. Please keep it under 50 MB.";

  await deleteAboutVideo();

  const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(`${FOLDER}/video.${ext}`, file, { upsert: true, contentType: file.type });

  return error ? error.message : null;
}

/** Remove the current About Us video. Returns an error message or null. */
export async function deleteAboutVideo(): Promise<string | null> {
  const name = await currentFileName();
  if (!name) return null;
  const { error } = await supabase.storage.from(BUCKET).remove([`${FOLDER}/${name}`]);
  return error ? error.message : null;
}
