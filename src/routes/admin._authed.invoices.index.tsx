import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Copy,
  Trash2,
  Download,
  Printer,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  computeTotals,
  deleteInvoice,
  duplicateInvoice,
  formatMoney,
  loadInvoices,
  type Invoice,
  type PaymentStatus,
} from "@/lib/admin-invoices";
import { generateInvoicePDF } from "@/lib/admin-invoice-pdf";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/_authed/invoices/")({
  component: InvoicesList,
});

const STATUS_STYLES: Record<PaymentStatus, string> = {
  draft: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  unpaid: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  partial: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  paid: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  overdue: "bg-red-100 text-red-800 hover:bg-red-100",
};

function InvoicesList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Invoice[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => { setRows(loadInvoices()); }, []);
  const refresh = () => setRows(loadInvoices());

  const filtered = rows.filter((r) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return (
      r.number.toLowerCase().includes(s) ||
      r.buyer.company.toLowerCase().includes(s) ||
      r.buyer.country.toLowerCase().includes(s)
    );
  });

  const handleDelete = (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    deleteInvoice(id);
    refresh();
    toast.success("Invoice deleted");
  };
  const handleDuplicate = (id: string) => {
    const copy = duplicateInvoice(id);
    if (copy) {
      refresh();
      toast.success(`Duplicated as ${copy.number}`);
    }
  };

  return (
    <div>
      <PageHeader
        title="Billing & Invoices"
        description="Create and manage professional Commercial Invoices for international buyers."
        actions={
          <Button onClick={() => navigate({ to: "/admin/invoices/$id", params: { id: "new" } })} className="gap-2">
            <Plus className="h-4 w-4" /> New Invoice
          </Button>
        }
      />

      <Card className="rounded-2xl border-border/60 p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by invoice #, buyer, country…"
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Incoterm</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-10 w-10 opacity-40" />
                      <p>No invoices yet.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate({ to: "/admin/invoices/$id", params: { id: "new" } })}
                      >
                        Create your first invoice
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((inv) => {
                  const { grand } = computeTotals(inv);
                  return (
                    <TableRow key={inv.id} className="group">
                      <TableCell className="font-medium">{inv.number}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{inv.buyer.company || "—"}</span>
                          <span className="text-xs text-muted-foreground">{inv.buyer.country}</span>
                        </div>
                      </TableCell>
                      <TableCell>{inv.info.date}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatMoney(grand, inv.info.currency)}
                      </TableCell>
                      <TableCell>{inv.info.currency}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{inv.shipping.incoterm}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_STYLES[inv.status]}>{inv.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            asChild
                            size="icon"
                            variant="ghost"
                            title="View / Edit"
                          >
                            <Link to="/admin/invoices/$id" params={{ id: inv.id }}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Download PDF"
                            onClick={() => generateInvoicePDF(inv, "save")}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Print"
                            onClick={() => generateInvoicePDF(inv, "print")}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" title="More">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate({ to: "/admin/invoices/$id", params: { id: inv.id } })
                                }
                              >
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(inv.id)}>
                                <Copy className="mr-2 h-4 w-4" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(inv.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
