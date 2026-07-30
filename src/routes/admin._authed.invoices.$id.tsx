import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Download,
  Printer,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  blankInvoice,
  computeTotals,
  CURRENCIES,
  formatMoney,
  INCOTERMS,
  loadInvoices,
  upsertInvoice,
  type Invoice,
  type InvoiceLine,
  type PaymentStatus,
  type TaxMode,
} from "@/lib/admin-invoices";
import { generateInvoicePDF } from "@/lib/admin-invoice-pdf";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/_authed/invoices/$id")({
  component: InvoiceEditor,
});

function InvoiceEditor() {
  const { id } = useParams({ from: "/admin/_authed/invoices/$id" });
  const navigate = useNavigate();
  const [inv, setInv] = useState<Invoice | null>(null);
  const autosaveRef = useRef<number | null>(null);

  useEffect(() => {
    if (id === "new") {
      setInv(blankInvoice());
    } else {
      const found = loadInvoices().find((i) => i.id === id);
      setInv(found ?? blankInvoice());
    }
  }, [id]);

  // Autosave (debounced)
  useEffect(() => {
    if (!inv) return;
    if (autosaveRef.current) window.clearTimeout(autosaveRef.current);
    autosaveRef.current = window.setTimeout(() => {
      upsertInvoice(inv);
    }, 800);
    return () => {
      if (autosaveRef.current) window.clearTimeout(autosaveRef.current);
    };
  }, [inv]);

  const totals = useMemo(() => (inv ? computeTotals(inv) : null), [inv]);

  if (!inv || !totals) return <div className="p-8 text-muted-foreground">Loading…</div>;

  const patch = (p: Partial<Invoice>) => setInv({ ...inv, ...p });
  const patchGroup = <K extends keyof Invoice>(k: K, p: Partial<Invoice[K]>) =>
    setInv({ ...inv, [k]: { ...(inv[k] as object), ...p } as Invoice[K] });

  const setLine = (idx: number, p: Partial<InvoiceLine>) => {
    const next = [...inv.lines];
    next[idx] = { ...next[idx], ...p };
    patch({ lines: next });
  };
  const addLine = () =>
    patch({
      lines: [
        ...inv.lines,
        {
          id: `l_${Date.now()}`,
          name: "",
          description: "",
          hsCode: "",
          origin: inv.exporter.country || "Egypt",
          quantity: 1,
          unit: "TON",
          unitPrice: 0,
        },
      ],
    });
  const removeLine = (idx: number) =>
    patch({ lines: inv.lines.filter((_, i) => i !== idx) });

  const validate = (): string | null => {
    if (!inv.buyer.company) return "Buyer company is required";
    if (!inv.buyer.country) return "Buyer country is required";
    if (!inv.lines.length) return "Add at least one product line";
    if (inv.lines.some((l) => !l.name)) return "Every product line needs a name";
    return null;
  };

  const saveDraft = () => {
    upsertInvoice(inv);
    toast.success("Draft saved");
  };
  const finalize = () => {
    const err = validate();
    if (err) return toast.error(err);
    const next: Invoice = { ...inv, finalized: true, status: inv.status === "draft" ? "unpaid" : inv.status };
    setInv(next);
    upsertInvoice(next);
    toast.success("Invoice finalized");
  };
  const doPDF = (mode: "save" | "print") => {
    const err = validate();
    if (err) return toast.error(err);
    upsertInvoice(inv);
    generateInvoicePDF(inv, mode);
  };

  const cur = inv.info.currency;

  return (
    <div>
      <PageHeader
        title={id === "new" ? "New Invoice" : `Invoice ${inv.number}`}
        description={`${inv.number} · ${inv.finalized ? "Finalized" : "Draft"} · Autosaves as you type`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/admin/invoices" })} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button variant="outline" onClick={saveDraft} className="gap-2">
              <Save className="h-4 w-4" /> Save Draft
            </Button>
            <Button variant="outline" onClick={() => doPDF("print")} className="gap-2">
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button variant="outline" onClick={() => doPDF("save")} className="gap-2">
              <Download className="h-4 w-4" /> PDF
            </Button>
            <Button onClick={finalize} className="gap-2">
              <CheckCircle2 className="h-4 w-4" /> Finalize
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Tabs defaultValue="parties">
            <TabsList className="grid grid-cols-2 sm:grid-cols-6">
              <TabsTrigger value="parties">Parties</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="tax">Tax & Bank</TabsTrigger>
              <TabsTrigger value="extras">Notes</TabsTrigger>
            </TabsList>

            {/* PARTIES */}
            <TabsContent value="parties" className="mt-4 space-y-6">
              <SectionCard title="Exporter Information" subtitle="Auto-filled from company settings">
                <Grid>
                  <Field label="Company Name">
                    <Input value={inv.exporter.company} onChange={(e) => patchGroup("exporter", { company: e.target.value })} />
                  </Field>
                  <Field label="Country">
                    <Input value={inv.exporter.country} onChange={(e) => patchGroup("exporter", { country: e.target.value })} />
                  </Field>
                  <Field label="Address" wide>
                    <Input value={inv.exporter.address} onChange={(e) => patchGroup("exporter", { address: e.target.value })} />
                  </Field>
                  <Field label="VAT Number">
                    <Input value={inv.exporter.vat} onChange={(e) => patchGroup("exporter", { vat: e.target.value })} />
                  </Field>
                  <Field label="Commercial Registration">
                    <Input value={inv.exporter.commercialRegistration} onChange={(e) => patchGroup("exporter", { commercialRegistration: e.target.value })} />
                  </Field>
                  <Field label="Tax Number">
                    <Input value={inv.exporter.taxNumber} onChange={(e) => patchGroup("exporter", { taxNumber: e.target.value })} />
                  </Field>
                  <Field label="Phone">
                    <Input value={inv.exporter.phone} onChange={(e) => patchGroup("exporter", { phone: e.target.value })} />
                  </Field>
                  <Field label="Email">
                    <Input value={inv.exporter.email} onChange={(e) => patchGroup("exporter", { email: e.target.value })} />
                  </Field>
                  <Field label="Website">
                    <Input value={inv.exporter.website} onChange={(e) => patchGroup("exporter", { website: e.target.value })} />
                  </Field>
                </Grid>
              </SectionCard>

              <SectionCard title="Buyer Information">
                <Grid>
                  <Field label="Company Name *">
                    <Input value={inv.buyer.company} onChange={(e) => patchGroup("buyer", { company: e.target.value })} />
                  </Field>
                  <Field label="Contact Person">
                    <Input value={inv.buyer.contactPerson} onChange={(e) => patchGroup("buyer", { contactPerson: e.target.value })} />
                  </Field>
                  <Field label="Address" wide>
                    <Input value={inv.buyer.address} onChange={(e) => patchGroup("buyer", { address: e.target.value })} />
                  </Field>
                  <Field label="City">
                    <Input value={inv.buyer.city} onChange={(e) => patchGroup("buyer", { city: e.target.value })} />
                  </Field>
                  <Field label="Postal Code">
                    <Input value={inv.buyer.postalCode} onChange={(e) => patchGroup("buyer", { postalCode: e.target.value })} />
                  </Field>
                  <Field label="Country *">
                    <Input value={inv.buyer.country} onChange={(e) => patchGroup("buyer", { country: e.target.value })} />
                  </Field>
                  <Field label="Email">
                    <Input value={inv.buyer.email} onChange={(e) => patchGroup("buyer", { email: e.target.value })} />
                  </Field>
                  <Field label="Phone">
                    <Input value={inv.buyer.phone} onChange={(e) => patchGroup("buyer", { phone: e.target.value })} />
                  </Field>
                  <Field label="VAT Number (optional)">
                    <Input value={inv.buyer.vat} onChange={(e) => patchGroup("buyer", { vat: e.target.value })} />
                  </Field>
                </Grid>
              </SectionCard>
            </TabsContent>

            {/* INFO */}
            <TabsContent value="info" className="mt-4">
              <SectionCard title="Invoice Information">
                <Grid>
                  <Field label="Invoice Number">
                    <Input value={inv.number} onChange={(e) => patch({ number: e.target.value })} />
                  </Field>
                  <Field label="Payment Status">
                    <Select value={inv.status} onValueChange={(v) => patch({ status: v as PaymentStatus })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(["draft", "unpaid", "partial", "paid", "overdue"] as PaymentStatus[]).map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Invoice Date">
                    <Input type="date" value={inv.info.date} onChange={(e) => patchGroup("info", { date: e.target.value })} />
                  </Field>
                  <Field label="Due Date">
                    <Input type="date" value={inv.info.dueDate} onChange={(e) => patchGroup("info", { dueDate: e.target.value })} />
                  </Field>
                  <Field label="Purchase Order #">
                    <Input value={inv.info.poNumber} onChange={(e) => patchGroup("info", { poNumber: e.target.value })} />
                  </Field>
                  <Field label="Contract #">
                    <Input value={inv.info.contractNumber} onChange={(e) => patchGroup("info", { contractNumber: e.target.value })} />
                  </Field>
                  <Field label="Currency">
                    <Select value={inv.info.currency} onValueChange={(v) => patchGroup("info", { currency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Payment Terms" wide>
                    <Input value={inv.info.paymentTerms} onChange={(e) => patchGroup("info", { paymentTerms: e.target.value })} />
                  </Field>
                </Grid>
              </SectionCard>
            </TabsContent>

            {/* PRODUCTS */}
            <TabsContent value="products" className="mt-4">
              <SectionCard
                title="Products"
                subtitle="Line totals calculate automatically"
                action={
                  <Button size="sm" onClick={addLine} className="gap-1">
                    <Plus className="h-4 w-4" /> Add Line
                  </Button>
                }
              >
                <div className="space-y-3">
                  {inv.lines.map((l, idx) => (
                    <div
                      key={l.id}
                      className="rounded-xl border border-border/60 bg-muted/20 p-3"
                    >
                      <div className="grid gap-2 md:grid-cols-12">
                        <Input
                          className="md:col-span-3"
                          placeholder="Product name"
                          value={l.name}
                          onChange={(e) => setLine(idx, { name: e.target.value })}
                        />
                        <Input
                          className="md:col-span-3"
                          placeholder="Description"
                          value={l.description}
                          onChange={(e) => setLine(idx, { description: e.target.value })}
                        />
                        <Input
                          className="md:col-span-1"
                          placeholder="HS"
                          value={l.hsCode}
                          onChange={(e) => setLine(idx, { hsCode: e.target.value })}
                        />
                        <Input
                          className="md:col-span-1"
                          placeholder="Origin"
                          value={l.origin}
                          onChange={(e) => setLine(idx, { origin: e.target.value })}
                        />
                        <Input
                          className="md:col-span-1"
                          type="number"
                          min={0}
                          placeholder="Qty"
                          value={l.quantity}
                          onChange={(e) => setLine(idx, { quantity: parseFloat(e.target.value) || 0 })}
                        />
                        <Input
                          className="md:col-span-1"
                          placeholder="Unit"
                          value={l.unit}
                          onChange={(e) => setLine(idx, { unit: e.target.value })}
                        />
                        <Input
                          className="md:col-span-1"
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="Price"
                          value={l.unitPrice}
                          onChange={(e) => setLine(idx, { unitPrice: parseFloat(e.target.value) || 0 })}
                        />
                        <div className="flex items-center justify-between gap-2 md:col-span-1">
                          <span className="text-sm font-semibold">
                            {formatMoney(l.quantity * l.unitPrice, cur)}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeLine(idx)}
                            disabled={inv.lines.length === 1}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </TabsContent>

            {/* SHIPPING */}
            <TabsContent value="shipping" className="mt-4">
              <SectionCard title="Shipping Information">
                <Grid>
                  <Field label="Incoterm">
                    <Select value={inv.shipping.incoterm} onValueChange={(v) => patchGroup("shipping", { incoterm: v as (typeof INCOTERMS)[number] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {INCOTERMS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Port of Loading">
                    <Input value={inv.shipping.portOfLoading} onChange={(e) => patchGroup("shipping", { portOfLoading: e.target.value })} />
                  </Field>
                  <Field label="Port of Discharge">
                    <Input value={inv.shipping.portOfDischarge} onChange={(e) => patchGroup("shipping", { portOfDischarge: e.target.value })} />
                  </Field>
                  <Field label={`Freight Cost (${cur})`}>
                    <Input type="number" min={0} step="0.01" value={inv.shipping.freight}
                      onChange={(e) => patchGroup("shipping", { freight: parseFloat(e.target.value) || 0 })} />
                  </Field>
                  <Field label={`Insurance Cost (${cur})`}>
                    <Input type="number" min={0} step="0.01" value={inv.shipping.insurance}
                      onChange={(e) => patchGroup("shipping", { insurance: parseFloat(e.target.value) || 0 })} />
                  </Field>
                  <Field label="Estimated Shipping Date">
                    <Input type="date" value={inv.shipping.shipDate} onChange={(e) => patchGroup("shipping", { shipDate: e.target.value })} />
                  </Field>
                  <Field label="Expected Arrival Date">
                    <Input type="date" value={inv.shipping.arrivalDate} onChange={(e) => patchGroup("shipping", { arrivalDate: e.target.value })} />
                  </Field>
                  <Field label="Container Number (optional)">
                    <Input value={inv.shipping.containerNumber} onChange={(e) => patchGroup("shipping", { containerNumber: e.target.value })} />
                  </Field>
                  <Field label="Vessel Name (optional)">
                    <Input value={inv.shipping.vesselName} onChange={(e) => patchGroup("shipping", { vesselName: e.target.value })} />
                  </Field>
                </Grid>
                <div className="mt-4">
                  <Field label="Transportation Details">
                    <Textarea
                      rows={3}
                      placeholder="e.g. In reefer truck, Temperature 13.0°C"
                      value={inv.shipping.transportation}
                      onChange={(e) => patchGroup("shipping", { transportation: e.target.value })}
                    />
                  </Field>
                </div>

              </SectionCard>
            </TabsContent>

            {/* TAX + BANK */}
            <TabsContent value="tax" className="mt-4 space-y-6">
              <SectionCard title="Taxes">
                <Grid>
                  <Field label="Tax Treatment">
                    <Select value={inv.tax.mode} onValueChange={(v) => patchGroup("tax", { mode: v as TaxMode })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vat">Apply VAT %</SelectItem>
                        <SelectItem value="zero-rated">Zero Rated Export</SelectItem>
                        <SelectItem value="exempt">Tax Exempt</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="VAT %">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      disabled={inv.tax.mode !== "vat"}
                      value={inv.tax.vatPercent}
                      onChange={(e) => patchGroup("tax", { vatPercent: parseFloat(e.target.value) || 0 })}
                    />
                  </Field>
                </Grid>
              </SectionCard>

              <SectionCard title="Bank Information">
                <Grid>
                  <Field label="Bank Name">
                    <Input value={inv.bank.name} onChange={(e) => patchGroup("bank", { name: e.target.value })} />
                  </Field>
                  <Field label="Account Name">
                    <Input value={inv.bank.accountName} onChange={(e) => patchGroup("bank", { accountName: e.target.value })} />
                  </Field>
                  <Field label="Account Number">
                    <Input value={inv.bank.accountNumber} onChange={(e) => patchGroup("bank", { accountNumber: e.target.value })} />
                  </Field>
                  <Field label="IBAN">
                    <Input value={inv.bank.iban} onChange={(e) => patchGroup("bank", { iban: e.target.value })} />
                  </Field>
                  <Field label="SWIFT">
                    <Input value={inv.bank.swift} onChange={(e) => patchGroup("bank", { swift: e.target.value })} />
                  </Field>
                </Grid>
              </SectionCard>
            </TabsContent>

            {/* EXTRAS */}
            <TabsContent value="extras" className="mt-4">
              <SectionCard title="Additional Information">
                <div className="grid gap-4">
                  <Field label="Notes">
                    <Textarea rows={3} value={inv.extras.notes} onChange={(e) => patchGroup("extras", { notes: e.target.value })} />
                  </Field>
                  <Field label="Declaration">
                    <Textarea rows={2} value={inv.extras.declaration} onChange={(e) => patchGroup("extras", { declaration: e.target.value })} />
                  </Field>
                  <Field label="Country of Origin Statement">
                    <Textarea rows={2} value={inv.extras.originStatement} onChange={(e) => patchGroup("extras", { originStatement: e.target.value })} />
                  </Field>
                  <Field label="Additional Terms">
                    <Textarea rows={2} value={inv.extras.additionalTerms} onChange={(e) => patchGroup("extras", { additionalTerms: e.target.value })} />
                  </Field>
                </div>
              </SectionCard>
            </TabsContent>
          </Tabs>
        </div>

        {/* Totals sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-20 rounded-2xl border-border/60 p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Summary
            </h3>
            <Separator className="my-3" />
            <div className="space-y-2 text-sm">
              <Row label="Subtotal" value={formatMoney(totals.subtotal, cur)} />
              <Row label="Freight" value={formatMoney(totals.freight, cur)} />
              <Row label="Insurance" value={formatMoney(totals.insurance, cur)} />
              <Row
                label={
                  inv.tax.mode === "vat"
                    ? `VAT (${inv.tax.vatPercent}%)`
                    : inv.tax.mode === "zero-rated"
                      ? "VAT (Zero-Rated)"
                      : "VAT (Exempt)"
                }
                value={formatMoney(totals.taxAmount, cur)}
              />
              <Separator className="my-2" />
              <div className="flex items-center justify-between text-base">
                <span className="font-semibold">Grand Total</span>
                <span className="text-lg font-bold text-primary">
                  {formatMoney(totals.grand, cur)}
                </span>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="grid gap-2">
              <Button onClick={() => doPDF("save")} className="gap-2" variant="outline">
                <Download className="h-4 w-4" /> Download PDF
              </Button>
              <Button onClick={finalize} className="gap-2">
                <CheckCircle2 className="h-4 w-4" /> Finalize Invoice
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border-border/60 p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function Field({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${wide ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
