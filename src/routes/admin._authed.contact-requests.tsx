import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Eye, Trash2, Search } from "lucide-react";
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
import { contactRequests as seed, type ContactRequest } from "@/lib/admin-mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/_authed/contact-requests")({
  component: ContactRequestsPage,
});

const statusColors: Record<ContactRequest["status"], string> = {
  new: "bg-blue-100 text-blue-700",
  "in-progress": "bg-amber-100 text-amber-700",
  closed: "bg-emerald-100 text-emerald-700",
};

function ContactRequestsPage() {
  const { t } = useAdminLang();
  const [rows, setRows] = useState<ContactRequest[]>(seed);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [viewing, setViewing] = useState<ContactRequest | null>(null);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchQ = !q || [r.company, r.contactPerson, r.email, r.country, r.product].some((v) => v.toLowerCase().includes(q.toLowerCase()));
      const matchS = status === "all" || r.status === status;
      return matchQ && matchS;
    });
  }, [rows, q, status]);

  const exportCSV = () => {
    const header = ["Company", "Contact", "Email", "Country", "Product", "Status", "Date"];
    const csv = [header, ...filtered.map((r) => [r.company, r.contactPerson, r.email, r.country, r.product, r.status, r.date])]
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

  const remove = (id: string) => {
    setRows((r) => r.filter((x) => x.id !== id));
    toast.success("Request deleted");
  };

  return (
    <div>
      <PageHeader
        title={t("nav.contact-requests")}
        description={t("contact-requests.desc")}
        actions={
          <Button onClick={exportCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

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
                <TableHead>Product</TableHead>
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
                  <TableCell className="text-muted-foreground">{r.email}</TableCell>
                  <TableCell>{r.country}</TableCell>
                  <TableCell>{r.product}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[r.status]} variant="secondary">{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setViewing(r)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(r.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No requests found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Request</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Company:</span> {viewing.company}</p>
              <p><span className="text-muted-foreground">Contact:</span> {viewing.contactPerson}</p>
              <p><span className="text-muted-foreground">Email:</span> {viewing.email}</p>
              <p><span className="text-muted-foreground">Country:</span> {viewing.country}</p>
              <p><span className="text-muted-foreground">Product:</span> {viewing.product}</p>
              <p><span className="text-muted-foreground">Status:</span> {viewing.status}</p>
              <p><span className="text-muted-foreground">Date:</span> {viewing.date}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
