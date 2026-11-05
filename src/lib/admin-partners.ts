// Partners stored in localStorage, Hostinger MySQL, and Supabase if configured.
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { apiPartners, uploadToHostinger } from "./hostinger-api";

const BUCKET = "site-media";
const FOLDER = "partners";
const SIGNED_TTL = 60 * 60 * 24 * 365; // 1 year
const PARTNERS_STORAGE_KEY = "app_partners";

export type Partner = {
  id: string;
  name: string;
  logo: string;
  logoPath: string;
  url?: string;
  enabled: boolean;
  sortOrder: number;
};

export const PARTNERS_EVENT = "fd:partners";

function notify() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(PARTNERS_EVENT));
}

function getLocalPartners(): Partner[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PARTNERS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function setLocalPartners(partners: Partner[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PARTNERS_STORAGE_KEY, JSON.stringify(partners));
  } catch {}
}

async function resolve(rows: any[]): Promise<Partner[]> {
  const paths = rows.map((r) => r.logo_path).filter(Boolean) as string[];
  const signed = new Map<string, string>();
  if (paths.length && isSupabaseConfigured()) {
    try {
      const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, SIGNED_TTL);
      (data ?? []).forEach((d) => {
        if (d.path && d.signedUrl) signed.set(d.path, d.signedUrl);
      });
    } catch {}
  }
  return rows.map((r) => ({
    id: r.id,
    name: r.name ?? "",
    logo: (r.logo_path && signed.get(r.logo_path)) || r.logo_url || r.logo || "",
    logoPath: r.logo_path ?? "",
    url: r.url || "",
    enabled: r.enabled !== false,
    sortOrder: r.sort_order ?? 1,
  }));
}

export async function listPartners(onlyEnabled = false): Promise<Partner[]> {
  // 1. Try Hostinger MySQL API
  try {
    const remote = await apiPartners.list(!onlyEnabled);
    if (Array.isArray(remote) && remote.length > 0) {
      const mapped = remote.map((r: any) => ({
        id: String(r.id),
        name: r.name ?? "",
        logo: r.logo_url || r.logo || "",
        logoPath: r.logo_path ?? "",
        url: r.url || "",
        enabled: Boolean(Number(r.enabled ?? 1)),
        sortOrder: Number(r.sort_order ?? 1),
      }));
      setLocalPartners(mapped);
      return onlyEnabled ? mapped.filter((p) => p.enabled) : mapped;
    }
  } catch {}

  // 2. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      let q = supabase.from("partners").select("*").order("sort_order");
      if (onlyEnabled) q = q.eq("enabled", true);
      const { data, error } = await q;
      if (!error && data && data.length > 0) {
        const resolved = await resolve(data as any[]);
        setLocalPartners(resolved);
        return resolved;
      }
    } catch {}
  }
  const partners = getLocalPartners();
  return onlyEnabled ? partners.filter((p) => p.enabled) : partners;
}

export async function savePartner(p: Partner): Promise<string | null> {
  const partners = getLocalPartners();
  const id = p.id || `partner-${Date.now()}`;
  const partner: Partner = { ...p, id, sortOrder: p.sortOrder || partners.length + 1 };

  const idx = partners.findIndex((item) => item.id === id);
  if (idx >= 0) {
    partners[idx] = partner;
  } else {
    partners.push(partner);
  }
  setLocalPartners(partners);
  notify();

  // 1. Try Hostinger MySQL API
  try {
    await apiPartners.save({
      id: partner.id,
      name: partner.name,
      logo_path: partner.logoPath,
      logo_url: partner.logo,
      url: partner.url ?? "",
      enabled: partner.enabled,
      sort_order: partner.sortOrder,
    });
  } catch {}

  // 2. If Supabase configured
  if (isSupabaseConfigured()) {
    try {
      const payload = {
        name: partner.name,
        logo_path: partner.logoPath,
        logo_url: partner.logoPath ? "" : partner.logo,
        url: partner.url ?? "",
        enabled: partner.enabled,
        sort_order: partner.sortOrder,
      };
      if (p.id) {
        await supabase.from("partners").update(payload).eq("id", p.id);
      } else {
        await supabase.from("partners").insert(payload);
      }
    } catch {}
  }

  return null;
}

export async function deletePartner(id: string): Promise<string | null> {
  const partners = getLocalPartners().filter((p) => p.id !== id);
  setLocalPartners(partners);
  notify();

  // 1. Try Hostinger MySQL API
  try {
    await apiPartners.delete(id);
  } catch {}

  // 2. If Supabase configured
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("partners").delete().eq("id", id);
    } catch {}
  }
  return null;
}

export async function setPartnerEnabled(id: string, enabled: boolean): Promise<string | null> {
  const partners = getLocalPartners();
  const p = partners.find((item) => item.id === id);
  if (p) {
    p.enabled = enabled;
    setLocalPartners(partners);
    notify();
  }

  try {
    if (p) await apiPartners.save(p);
  } catch {}

  if (isSupabaseConfigured()) {
    try {
      await supabase.from("partners").update({ enabled }).eq("id", id);
    } catch {}
  }
  return null;
}

export async function savePartnerOrder(rows: { id: string; sortOrder: number }[]) {
  const partners = getLocalPartners();
  const map = new Map(rows.map((r) => [r.id, r.sortOrder]));
  partners.forEach((p) => {
    if (map.has(p.id)) p.sortOrder = map.get(p.id)!;
  });
  partners.sort((a, b) => a.sortOrder - b.sortOrder);
  setLocalPartners(partners);
  notify();

  if (isSupabaseConfigured()) {
    try {
      await Promise.all(
        rows.map((r) => supabase.from("partners").update({ sort_order: r.sortOrder }).eq("id", r.id)),
      );
    } catch {}
  }
}

export async function uploadPartnerLogo(
  file: File,
): Promise<{ path?: string; url?: string; error?: string }> {
  // 1. Try uploading to Hostinger backend
  try {
    const res = await uploadToHostinger(file, "partners");
    if (res?.url) return { path: res.path, url: res.url };
  } catch {}

  // 2. Local fallback
  if (!isSupabaseConfigured()) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ path: "", url: reader.result as string });
      reader.onerror = () => resolve({ error: "Failed to read logo" });
      reader.readAsDataURL(file);
    });
  }

  // 3. Supabase fallback
  try {
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${FOLDER}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type || "image/png",
    });
    if (error) return { error: error.message };
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL);
    return data?.signedUrl ? { path, url: data.signedUrl } : { error: "Could not create logo URL." };
  } catch (err: any) {
    return { error: err?.message || "Upload failed" };
  }
}

export function blankPartner(sortOrder: number): Partner {
  return { id: "", name: "", logo: "", logoPath: "", url: "", enabled: true, sortOrder };
}
