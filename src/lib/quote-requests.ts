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

function getLocalQuotes(): QuoteRequestRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUOTES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: "q-1",
      company: "EuroFresh Logistics",
      contactPerson: "Jean Dupont",
      email: "j.dupont@eurofresh.fr",
      country: "France",
      product: "Oranges",
      quantity: "2x 40ft Containers",
      status: "pending",
      date: new Date().toISOString().slice(0, 10),
    },
  ];
}

export async function fetchQuoteRequests(): Promise<QuoteRequestRow[]> {
  // 1. Try Hostinger MySQL API
  try {
    const remote = await apiQuotes.list();
    if (Array.isArray(remote) && remote.length > 0) {
      return remote.map((r: any) => ({
        id: String(r.id),
        company: r.company ?? "",
        contactPerson: r.contact_person ?? r.name ?? "",
        email: r.email ?? "",
        country: r.country ?? "",
        product: r.product ?? "",
        quantity: r.quantity ?? "",
        status: (r.status as QuoteStatus) ?? "pending",
        date: (r.created_at || new Date().toISOString()).slice(0, 10),
      }));
    }
  } catch {}

  return getLocalQuotes();
}

export async function deleteQuoteRequest(id: string): Promise<void> {
  if (typeof window !== "undefined") {
    const quotes = getLocalQuotes().filter((q) => q.id !== id);
    try {
      localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
    } catch {}
  }

  // 1. Try Hostinger MySQL API
  try {
    await apiQuotes.delete(id);
  } catch {}
}
