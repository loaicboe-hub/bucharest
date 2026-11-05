import { apiPartners, uploadToHostinger } from "./hostinger-api";

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

export async function listPartners(onlyEnabled = false): Promise<Partner[]> {
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

  return null;
}

export async function deletePartner(id: string): Promise<string | null> {
  const partners = getLocalPartners().filter((p) => p.id !== id);
  setLocalPartners(partners);
  notify();

  try {
    await apiPartners.delete(id);
  } catch {}
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
}

export async function uploadPartnerLogo(
  file: File,
): Promise<{ path?: string; url?: string; error?: string }> {
  try {
    const res = await uploadToHostinger(file, "partners");
    if (res?.url) return { path: res.path, url: res.url };
  } catch {}

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ path: "", url: reader.result as string });
    reader.onerror = () => resolve({ error: "Failed to read logo" });
    reader.readAsDataURL(file);
  });
}

export function blankPartner(sortOrder: number): Partner {
  return { id: "", name: "", logo: "", logoPath: "", url: "", enabled: true, sortOrder };
}
