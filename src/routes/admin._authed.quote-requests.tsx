import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Eye, Trash2, Search, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminLang } from "@/lib/admin-i18n";
import {
  fetchQuoteRequests,
  deleteQuoteRequest,
  updateQuoteStatus,
  type QuoteRequestRow,
  type QuoteStatus,
} from "@/lib/quote-requests";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/_authed/quote-requests")({
  component: QuoteRequestsPage,
});

const statusColors: Record<QuoteStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  sent: "bg-blue-100 text-blue-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-rose-100 text-rose-700",
};

function QuoteRequestsPage() {
  const { t } = useAdminLang();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [viewing, setViewing] = useState<QuoteRequestRow | null>(null);

  const {
    data: rows = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["quote-requests"],
    queryFn: fetchQuoteRequests,
  });

  const removeMutation = useMutation({
    mutationFn: deleteQuoteRequest,
    onSuccess: (_data, deletedId) => {
      queryClient.setQueryData<QuoteRequestRow[]>(["quote-requests"], (old = []) =>
        old.filter((row) => row.id !== deletedId),
      );
      if (viewing?.id === deletedId) {
        setViewing(null);
      }
      queryClient.invalidateQueries({ queryKey: ["quote-requests"] });
      toast.success("Quote request deleted");
    },
    onError: (e: Error) => toast.error(e.message || "Could not delete quote request"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: QuoteStatus }) =>
      updateQuoteStatus(id, nextStatus),
    onSuccess: (_data, { id, nextStatus }) => {
      queryClient.setQueryData<QuoteRequestRow[]>(["quote-requests"], (old = []) =>
        old.map((row) => (row.id === id ? { ...row, status: nextStatus } : row)),
      );
      setViewing((curr) => (curr && curr.id === id ? { ...curr, status: nextStatus } : curr));
      queryClient.invalidateQueries({ queryKey: ["quote-requests"] });
      toast.success("Quote status updated");
    },
    onError: (e: Error) => toast.error(e.message || "Could not update quote status"),
  });

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const matchQ =
          !q ||
          [r.company, r.contactPerson, r.email, r.country, r.product].some((v) =>
            v.toLowerCase().includes(q.toLowerCase()),
          );
        const matchS = status === "all" || r.status === status;
        return matchQ && matchS;
      }),
    [rows, q, status],
  );

  const exportCSV = () => {
    const header = ["Company", "Contact", "Email", "Country", "Product", "Quantity", "Status", "Date"];
    const csv = [
      header,
      ...filtered.map((r) => [
        r.company,
        r.contactPerson,
        r.email,
        r.country,
        r.product,
        r.quantity,
        r.status,
        r.date,
      ]),
    ]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
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
        title={t("nav.quote-requests")}
        description={t("quote-requests.desc")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2" disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        }
      />

      {isError && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {(error as Error)?.message || "Failed to load quote requests from server."}
        </div>
      )}

      <Card className="rounded-2xl border-border/60 p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
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
                  <TableCell className="font-medium">{r.company || "—"}</TableCell>
                  <TableCell>{r.contactPerson || "—"}</TableCell>
                  <TableCell>{r.country || "—"}</TableCell>
                  <TableCell>{r.product || "—"}</TableCell>
                  <TableCell>{r.quantity || "—"}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[r.status] || statusColors.pending} variant="secondary">
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setViewing(r)} aria-label="View quote details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Delete quote request"
                        disabled={removeMutation.isPending && removeMutation.variables === r.id}
                        onClick={() => removeMutation.mutate(r.id)}
                      >
                        {removeMutation.isPending && removeMutation.variables === r.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    {isLoading ? "Loading…" : "No quotes found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle>Quote Request Details</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <p>
                <span className="font-medium text-slate-500">Company:</span> {viewing.company || "—"}
              </p>
              <p>
                <span className="font-medium text-slate-500">Contact:</span> {viewing.contactPerson || "—"}
              </p>
              <p>
                <span className="font-medium text-slate-500">Email:</span> {viewing.email || "—"}
              </p>
              <p>
                <span className="font-medium text-slate-500">Country:</span> {viewing.country || "—"}
              </p>
              <p>
                <span className="font-medium text-slate-500">Product:</span> {viewing.product || "—"}
              </p>
              <p>
                <span className="font-medium text-slate-500">Quantity / Notes:</span> {viewing.quantity || "—"}
              </p>
              <p>
                <span className="font-medium text-slate-500">Date:</span> {viewing.date}
              </p>
              <div className="flex items-center justify-between gap-3 border-t pt-3">
                <Select
                  value={viewing.status}
                  onValueChange={(nextStatus) =>
                    statusMutation.mutate({ id: viewing.id, nextStatus: nextStatus as QuoteStatus })
                  }
                  disabled={statusMutation.isPending}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={removeMutation.isPending && removeMutation.variables === viewing.id}
                  onClick={() => removeMutation.mutate(viewing.id)}
                >
                  {removeMutation.isPending && removeMutation.variables === viewing.id ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-1.5 h-4 w-4" />
                  )}
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
