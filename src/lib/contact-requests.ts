import { apiContacts } from "./hostinger-api";

export type ContactStatus = "new" | "in-progress" | "closed";

export type ContactRequestRow = {
  id: string;
  name: string;
  company: string;
  country: string;
  email: string;
  phone: string;
  message: string;
  status: ContactStatus;
  date: string;
};

const CONTACTS_STORAGE_KEY = "app_contact_requests";

function isLocalPreviewHost(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

function getLocalContacts(): ContactRequestRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function setLocalContacts(rows: ContactRequestRow[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(rows));
  } catch {}
}

export async function submitContactRequest(input: {
  name: string;
  company: string;
  country: string;
  email: string;
  phone: string;
  message: string;
}): Promise<string> {
  try {
    const res = await apiContacts.submit(input);
    const created: ContactRequestRow = {
      id: res?.id || `contact-${Date.now().toString(36)}`,
      ...input,
      status: "new",
      date: new Date().toISOString().slice(0, 10),
    };
    setLocalContacts([created, ...getLocalContacts().filter((c) => c.id !== created.id)]);
    return created.id;
  } catch (err) {
    if (!isLocalPreviewHost()) {
      throw err;
    }
    const created: ContactRequestRow = {
      id: `contact-${Date.now().toString(36)}`,
      ...input,
      status: "new",
      date: new Date().toISOString().slice(0, 10),
    };
    setLocalContacts([created, ...getLocalContacts()]);
    return created.id;
  }
}

export async function fetchContactRequests(): Promise<ContactRequestRow[]> {
  try {
    const remote = await apiContacts.list();
    if (Array.isArray(remote)) {
      const mapped: ContactRequestRow[] = remote.map((r: any) => ({
        id: String(r.id),
        name: String(r.name ?? r.contact_person ?? ""),
        company: String(r.company ?? ""),
        country: String(r.country ?? ""),
        email: String(r.email ?? ""),
        phone: String(r.phone ?? ""),
        message: String(r.message ?? ""),
        status: (r.status as ContactStatus) || "new",
        date: String(r.date ?? r.created_at ?? new Date().toISOString()).slice(0, 10),
      }));
      setLocalContacts(mapped);
      return mapped;
    }
  } catch (err) {
    if (!isLocalPreviewHost()) {
      throw err;
    }
  }

  return getLocalContacts();
}

export async function updateContactStatus(id: string, status: ContactStatus): Promise<void> {
  try {
    await apiContacts.updateStatus(id, status);
  } catch (err) {
    if (!isLocalPreviewHost()) {
      throw err;
    }
  }

  const next = getLocalContacts().map((c) => (c.id === id ? { ...c, status } : c));
  setLocalContacts(next);
}

export async function deleteContactRequest(id: string): Promise<void> {
  try {
    await apiContacts.delete(id);
  } catch (err) {
    if (!isLocalPreviewHost()) {
      throw err;
    }
  }

  const next = getLocalContacts().filter((c) => c.id !== id);
  setLocalContacts(next);
}
