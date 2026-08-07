// Partners are stored in the backend (partners table) so they persist
// across devices and browser sessions. Logos live in the site-media bucket.
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "site-media";
const FOLDER = "partners";
const SIGNED_TTL = 60 * 60 * 24 * 365; // 1 year

export type Partner = {
  id: string;
  name: string;
  logo: string; // resolved URL for display
  logoPath: string; // storage path (empty for remote logos)
  url?: string;
  enabled: boolean;
  sortOrder: number;
};

export const PARTNERS_EVENT = "fd:partners";

function notify() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(PARTNERS_EVENT));
}

/** Turn stored rows into displayable partners, refreshing signed logo URLs. */
async function resolve(rows: any[]): Promise<Partner[]> {
  const paths = rows.map((r) => r.logo_path).filter(Boolean) as string[];
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, SIGNED_TTL);
    (data ?? []).forEach((d) => {
      if (d.path && d.signedUrl) signed.set(d.path, d.signedUrl);
    });
  }
  return rows.map((r) => ({
    id: r.id,
    name: r.name ?? "",
    logo: (r.logo_path && signed.get(r.logo_path)) || r.logo_url || "",
    logoPath: r.logo_path ?? "",
    url: r.url || "",
    enabled: r.enabled !== false,
    sortOrder: r.sort_order ?? 1,
  }));
}

export async function listPartners(onlyEnabled = false): Promise<Partner[]> {
  let q = supabase.from("partners").select("*").order("sort_order");
  if (onlyEnabled) q = q.eq("enabled", true);
  const { data, error } = await q;
  if (error || !data) return [];
  return resolve(data as any[]);
}

export async function savePartner(p: Partner): Promise<string | null> {
  const payload = {
    name: p.name,
    logo_path: p.logoPath,
    logo_url: p.logoPath ? "" : p.logo,
    url: p.url ?? "",
    enabled: p.enabled,
    sort_order: p.sortOrder,
  };
  const { error } = p.id
    ? await supabase.from("partners").update(payload).eq("id", p.id)
    : await supabase.from("partners").insert(payload);
  if (!error) notify();
  return error ? error.message : null;
}

export async function deletePartner(id: string): Promise<string | null> {
  const { error } = await supabase.from("partners").delete().eq("id", id);
  if (!error) notify();
  return error ? error.message : null;
}

export async function setPartnerEnabled(id: string, enabled: boolean): Promise<string | null> {
  const { error } = await supabase.from("partners").update({ enabled }).eq("id", id);
  if (!error) notify();
  return error ? error.message : null;
}

export async function savePartnerOrder(rows: { id: string; sortOrder: number }[]) {
  await Promise.all(
    rows.map((r) => supabase.from("partners").update({ sort_order: r.sortOrder }).eq("id", r.id)),
  );
  notify();
}

/** Uploads a logo to storage and returns its path + a signed display URL. */
export async function uploadPartnerLogo(
  file: File,
): Promise<{ path?: string; url?: string; error?: string }> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${FOLDER}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || "image/png",
  });
  if (error) return { error: error.message };
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL);
  return data?.signedUrl ? { path, url: data.signedUrl } : { error: "Could not create logo URL." };
}

export function blankPartner(sortOrder: number): Partner {
  return { id: "", name: "", logo: "", logoPath: "", url: "", enabled: true, sortOrder };
}
