import { apiQuotes } from "./hostinger-api";

export type QuoteStatus = "pending" | "sent" | "won" | "lost";

export type QuoteRequestRow = {
  id: string;
  company: string;
  contactPerson: string;
  email: string;
  country: string;
  product: string;
  quantity: string;
  status: QuoteStatus;
  date: string;
};

const QUOTES_STORAGE_KEY = "app_quote_requests";

function isLocalPreviewHost(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

function getLocalQuotes(): QuoteRequestRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUOTES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function setLocalQuotes(quotes: QuoteRequestRow[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
  } catch {}
}

export async function submitQuoteRequest(input: {
  company: string;
  contactPerson: string;
  email: string;
  country: string;
  product: string;
  quantity: string;
}): Promise<string> {
  try {
    const res = await apiQuotes.submit(input);
    const created: QuoteRequestRow = {
      id: res?.id || `quote-${Date.now().toString(36)}`,
      company: input.company,
      contactPerson: input.contactPerson,
      email: input.email,
      country: input.country,
      product: input.product,
      quantity: input.quantity,
      status: "pending",
      date: new Date().toISOString().slice(0, 10),
    };
    const next = [created, ...getLocalQuotes().filter((q) => q.id !== created.id)];
    setLocalQuotes(next);
    return created.id;
  } catch (err) {
    if (!isLocalPreviewHost()) {
      throw err;
    }
    const created: QuoteRequestRow = {
      id: `quote-${Date.now().toString(36)}`,
      ...input,
      status: "pending",
      date: new Date().toISOString().slice(0, 10),
    };
    setLocalQuotes([created, ...getLocalQuotes()]);
    return created.id;
  }
}

export async function fetchQuoteRequests(): Promise<QuoteRequestRow[]> {
  try {
    const remote = await apiQuotes.list();
    if (Array.isArray(remote)) {
      const mapped: QuoteRequestRow[] = remote.map((r: any) => ({
        id: String(r.id),
        company: String(r.company ?? ""),
        contactPerson: String(r.contactPerson ?? r.contact_person ?? r.name ?? ""),
        email: String(r.email ?? ""),
        country: String(r.country ?? ""),
        product: String(r.product ?? ""),
        quantity: String(r.quantity ?? ""),
        status: (r.status as QuoteStatus) || "pending",
        date: String(r.date ?? r.created_at ?? new Date().toISOString()).slice(0, 10),
      }));
      setLocalQuotes(mapped);
      return mapped;
    }
  } catch (err) {
    if (!isLocalPreviewHost()) {
      throw err;
    }
  }

  return getLocalQuotes();
}

export async function updateQuoteStatus(id: string, status: QuoteStatus): Promise<void> {
  try {
    await apiQuotes.updateStatus(id, status);
  } catch (err) {
    if (!isLocalPreviewHost()) {
      throw err;
    }
  }

  const next = getLocalQuotes().map((q) => (q.id === id ? { ...q, status } : q));
  setLocalQuotes(next);
}

export async function deleteQuoteRequest(id: string): Promise<void> {
  try {
    await apiQuotes.delete(id);
  } catch (err) {
    if (!isLocalPreviewHost()) {
      throw err;
    }
  }

  const quotes = getLocalQuotes().filter((q) => q.id !== id);
  setLocalQuotes(quotes);
}
