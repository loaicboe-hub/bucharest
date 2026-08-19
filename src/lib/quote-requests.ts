import { supabase } from "@/integrations/supabase/client";

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

export async function fetchQuoteRequests(): Promise<QuoteRequestRow[]> {
  const { data, error } = await supabase
    .from("quote_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    company: r.company,
    contactPerson: r.contact_person,
    email: r.email,
    country: r.country,
    product: r.product,
    quantity: r.quantity,
    status: (r.status as QuoteStatus) ?? "pending",
    date: r.created_at.slice(0, 10),
  }));
}

export async function deleteQuoteRequest(id: string): Promise<void> {
  const { error, count } = await supabase
    .from("quote_requests")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw error;
  if (!count) throw new Error("Delete was blocked — you may not have permission.");
}
