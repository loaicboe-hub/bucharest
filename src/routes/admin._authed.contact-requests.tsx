import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Eye, Trash2, Search, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminLang } from "@/lib/admin-i18n";
import {
  fetchContactRequests,
  deleteContactRequest,
  updateContactStatus,
  type ContactRequestRow,
  type ContactStatus,
} from "@/lib/contact-requests";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/_authed/contact-requests")({
  component: ContactRequestsPage,
});

const statusColors: Record<ContactStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  "in-progress": "bg-amber-100 text-amber-700",
  closed: "bg-emerald-100 text-emerald-700",
};

function ContactRequestsPage() {
  const { t } = useAdminLang();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [viewing, setViewing] = useState<ContactRequestRow | null>(null);

  const {
    data: rows = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["contact-requests"],
    queryFn: fetchContactRequests,
  });

  const removeMutation = useMutation({
    mutationFn: deleteContactRequest,
    onSuccess: (_data, deletedId) => {
      queryClient.setQueryData<ContactRequestRow[]>(["contact-requests"], (old = []) =>
        old.filter((row) => row.id !== deletedId),
      );
      if (viewing?.id === deletedId) setViewing(null);
      queryClient.invalidateQueries({ queryKey: ["contact-requests"] });
      toast.success("Request deleted");
    },
    onError: (e: Error) => toast.error(e.message || "Could not delete request"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: ContactStatus }) =>
      updateContactStatus(id, nextStatus),
    onSuccess: (_data, { id, nextStatus }) => {
      queryClient.setQueryData<ContactRequestRow[]>(["contact-requests"], (old = []) =>
        old.map((row) => (row.id === id ? { ...row, status: nextStatus } : row)),
      );
      setViewing((curr) => (curr && curr.id === id ? { ...curr, status: nextStatus } : curr));
      queryClient.invalidateQueries({ queryKey: ["contact-requests"] });
      toast.success("Status updated");
    },
    onError: (e: Error) => toast.error(e.message || "Could not update status"),
  });

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchQ =
        !q ||
        [r.company, r.name, r.email, r.country, r.phone, r.message].some((v) =>
          v.toLowerCase().includes(q.toLowerCase()),
        );
      const matchS = status === "all" || r.status === status;
      return matchQ && matchS;
    });
  }, [rows, q, status]);

  const exportCSV = () => {
    const header = ["Company", "Contact", "Email", "Country", "Phone", "Message", "Status", "Date"];
    const csv = [
      header,
      ...filtered.map((r) => [r.company, r.name, r.email, r.country, r.phone, r.message, r.status, r.date]),
    ]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contact-requests.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  return (
    <div>
      <PageHeader
        title={t("nav.contact-requests")}
        description={t("contact-requests.desc")}
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
          {(error as Error)?.message || "Failed to load contact requests from server."}
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
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.company || "—"}</TableCell>
                  <TableCell>{r.name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{r.email || "—"}</TableCell>
                  <TableCell>{r.country || "—"}</TableCell>
                  <TableCell>{r.phone || "—"}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[r.status] || statusColors.new} variant="secondary">
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setViewing(r)} aria-label="View contact">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Delete contact"
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
                    {isLoading ? "Loading…" : "No requests found"}
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
            <DialogTitle>Contact Request</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <p><span className="font-medium text-slate-500">Company:</span> {viewing.company || "—"}</p>
              <p><span className="font-medium text-slate-500">Contact:</span> {viewing.name || "—"}</p>
              <p><span className="font-medium text-slate-500">Email:</span> {viewing.email || "—"}</p>
              <p><span className="font-medium text-slate-500">Country:</span> {viewing.country || "—"}</p>
              <p><span className="font-medium text-slate-500">Phone:</span> {viewing.phone || "—"}</p>
              <p><span className="font-medium text-slate-500">Message:</span> {viewing.message || "—"}</p>
              <p><span className="font-medium text-slate-500">Date:</span> {viewing.date}</p>
              <div className="flex items-center justify-between gap-3 border-t pt-3">
                <Select
                  value={viewing.status}
                  onValueChange={(nextStatus) =>
                    statusMutation.mutate({ id: viewing.id, nextStatus: nextStatus as ContactStatus })
                  }
                  disabled={statusMutation.isPending}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
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
