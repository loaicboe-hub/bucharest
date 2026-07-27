import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Eye, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/PageHeader";
import { quoteRequests as seed, type QuoteRequest } from "@/lib/admin-mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/_authed/quote-requests")({
  component: QuoteRequestsPage,
});

const statusColors: Record<QuoteRequest["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  sent: "bg-blue-100 text-blue-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-rose-100 text-rose-700",
};

function QuoteRequestsPage() {
  const [rows, setRows] = useState<QuoteRequest[]>(seed);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => rows.filter((r) => {
    const matchQ = !q || [r.company, r.contactPerson, r.email, r.country, r.product].some((v) => v.toLowerCase().includes(q.toLowerCase()));
    const matchS = status === "all" || r.status === status;
    return matchQ && matchS;
  }), [rows, q, status]);

  const exportCSV = () => {
    const header = ["Company", "Contact", "Email", "Country", "Product", "Quantity", "Status", "Date"];
    const csv = [header, ...filtered.map((r) => [r.company, r.contactPerson, r.email, r.country, r.product, r.quantity, r.status, r.date])]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quote-requests.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  return (
    <div>
      <PageHeader
        title="Quote Requests"
        description="Requests for pricing and quantity quotations"
        actions={<Button onClick={exportCSV} variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export CSV</Button>}
      />
      <Card className="rounded-2xl border-border/60 p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.company}</TableCell>
                  <TableCell>{r.contactPerson}</TableCell>
                  <TableCell>{r.country}</TableCell>
                  <TableCell>{r.product}</TableCell>
                  <TableCell>{r.quantity}</TableCell>
                  <TableCell><Badge className={statusColors[r.status]} variant="secondary">{r.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{r.date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost"><Eye className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => { setRows((rs) => rs.filter((x) => x.id !== r.id)); toast.success("Deleted"); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No quotes found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
