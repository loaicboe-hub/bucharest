export type Partner = {
  id: string;
  name: string;
  logo: string; // data URL or remote URL
  url?: string;
  enabled: boolean;
};

const KEY = "fd_partners";
export const PARTNERS_EVENT = "fd:partners";

export const defaultPartners: Partner[] = [];

export function loadPartners(): Partner[] {
  if (typeof window === "undefined") return defaultPartners;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultPartners;
    const parsed = JSON.parse(raw) as Partner[];
    if (!Array.isArray(parsed)) return defaultPartners;
    return parsed.map((p) => ({ ...p, enabled: p.enabled !== false }));
  } catch {
    return defaultPartners;
  }
}

export function savePartners(list: Partner[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(PARTNERS_EVENT));
}
