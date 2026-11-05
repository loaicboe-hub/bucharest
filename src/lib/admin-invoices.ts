// Local-storage backed store for Commercial Invoices.

export type Incoterm = "EXW" | "FCA" | "FOB" | "CFR" | "CIF" | "CPT" | "CIP" | "DAP" | "DPU" | "DDP";
export type PaymentStatus = "draft" | "unpaid" | "partial" | "paid" | "overdue";
export type TaxMode = "vat" | "zero-rated" | "exempt";

export type InvoiceLine = {
  id: string;
  name: string;
  description: string;
  hsCode: string;
  origin: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

export type Invoice = {
  id: string;
  number: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  finalized: boolean;

  exporter: {
    company: string;
    address: string;
    country: string;
    vat: string;
    commercialRegistration: string;
    taxNumber: string;
    phone: string;
    email: string;
    website: string;
  };
  buyer: {
    company: string;
    contactPerson: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    email: string;
    phone: string;
    vat: string;
  };
  info: {
    date: string;
    dueDate: string;
    poNumber: string;
    contractNumber: string;
    currency: string;
    paymentTerms: string;
  };
  lines: InvoiceLine[];
  shipping: {
    incoterm: Incoterm;
    portOfLoading: string;
    portOfDischarge: string;
    freight: number;
    insurance: number;
    shipDate: string;
    arrivalDate: string;
    containerNumber: string;
    vesselName: string;
    transportation: string;

  };
  tax: {
    mode: TaxMode;
    vatPercent: number;
  };
  extras: {
    notes: string;
    declaration: string;
    originStatement: string;
    additionalTerms: string;
  };
  bank: {
    name: string;
    accountName: string;
    accountNumber: string;
    iban: string;
    swift: string;
  };
};

const KEY = "fd_invoices";

export const CURRENCIES = ["USD", "EUR", "GBP", "AED", "SAR", "EGP"];
export const INCOTERMS: Incoterm[] = ["EXW", "FCA", "FOB", "CFR", "CIF", "CPT", "CIP", "DAP", "DPU", "DDP"];

export const DEFAULT_EXPORTER = {
  company: "BucharestEgyAgro Import and Export",
  address: "Industrial Zone, Cairo",
  country: "Egypt",
  vat: "100-200-300",
  commercialRegistration: "CR-2026-4567",
  taxNumber: "TAX-889977",
  phone: "+20 107 003 3892",
  email: "export@bucharestegyagro.com",
  website: "www.bucharestegyagro.com",
};

export function loadInvoices(): Invoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    return JSON.parse(raw) as Invoice[];
  } catch {
    return [];
  }
}

export function saveInvoices(list: Invoice[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function upsertInvoice(inv: Invoice) {
  const list = loadInvoices();
  const idx = list.findIndex((i) => i.id === inv.id);
  const next = { ...inv, updatedAt: new Date().toISOString() };
  if (idx === -1) list.unshift(next);
  else list[idx] = next;
  saveInvoices(list);
  return next;
}

export function deleteInvoice(id: string) {
  saveInvoices(loadInvoices().filter((i) => i.id !== id));
}

export function duplicateInvoice(id: string): Invoice | null {
  const list = loadInvoices();
  const src = list.find((i) => i.id === id);
  if (!src) return null;
  const copy: Invoice = {
    ...src,
    id: `inv_${Date.now()}`,
    number: nextInvoiceNumber(list),
    status: "draft",
    finalized: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveInvoices([copy, ...list]);
  return copy;
}

export function nextInvoiceNumber(existing?: Invoice[]): string {
  const list = existing ?? loadInvoices();
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const nums = list
    .map((i) => i.number)
    .filter((n) => n.startsWith(prefix))
    .map((n) => parseInt(n.slice(prefix.length), 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

export function blankInvoice(): Invoice {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: `inv_${Date.now()}`,
    number: nextInvoiceNumber(),
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    finalized: false,
    exporter: { ...DEFAULT_EXPORTER },
    buyer: {
      company: "",
      contactPerson: "",
      address: "",
      city: "",
      country: "",
      postalCode: "",
      email: "",
      phone: "",
      vat: "",
    },
    info: {
      date: today,
      dueDate: today,
      poNumber: "",
      contractNumber: "",
      currency: "USD",
      paymentTerms: "50% advance, 50% against BL copy",
    },
    lines: [
      {
        id: `l_${Date.now()}`,
        name: "",
        description: "",
        hsCode: "",
        origin: "Egypt",
        quantity: 1,
        unit: "TON",
        unitPrice: 0,
      },
    ],
    shipping: {
      incoterm: "FOB",
      portOfLoading: "Alexandria, Egypt",
      portOfDischarge: "",
      freight: 0,
      insurance: 0,
      shipDate: "",
      arrivalDate: "",
      containerNumber: "",
      vesselName: "",
      transportation: "",
    },

    tax: { mode: "zero-rated", vatPercent: 0 },
    extras: {
      notes: "",
      declaration:
        "We hereby certify that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
      originStatement: "The goods described above are of Egyptian origin.",
      additionalTerms: "",
    },
    bank: {
      name: "",
      accountName: "BucharestEgyAgro Import and Export",
      accountNumber: "",
      iban: "",
      swift: "",
    },
  };
}

export function computeTotals(inv: Invoice) {
  const subtotal = inv.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const freight = Number(inv.shipping.freight) || 0;
  const insurance = Number(inv.shipping.insurance) || 0;
  const taxable = subtotal + freight + insurance;
  const taxAmount =
    inv.tax.mode === "vat" ? taxable * ((Number(inv.tax.vatPercent) || 0) / 100) : 0;
  const grand = taxable + taxAmount;
  return { subtotal, freight, insurance, taxAmount, grand };
}

export function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value || 0);
  } catch {
    return `${currency} ${(value || 0).toFixed(2)}`;
  }
}

function seed(): Invoice[] {
  const base = blankInvoice();
  const inv: Invoice = {
    ...base,
    number: "INV-2026-0001",
    status: "unpaid",
    finalized: true,
    buyer: {
      company: "EuroFresh GmbH",
      contactPerson: "Hans Müller",
      address: "Hafenstrasse 12",
      city: "Hamburg",
      country: "Germany",
      postalCode: "20457",
      email: "hans@eurofresh.de",
      phone: "+49 40 1234 5678",
      vat: "DE123456789",
    },
    info: { ...base.info, currency: "EUR", poNumber: "PO-2026-778", contractNumber: "CT-2026-14" },
    lines: [
      {
        id: "l1",
        name: "Valencia Oranges",
        description: "Class I, 15kg carton",
        hsCode: "0805.10",
        origin: "Egypt",
        quantity: 20,
        unit: "TON",
        unitPrice: 780,
      },
      {
        id: "l2",
        name: "Red Pomegranates",
        description: "Wonderful variety, 4.5kg carton",
        hsCode: "0810.90",
        origin: "Egypt",
        quantity: 5,
        unit: "TON",
        unitPrice: 1450,
      },
    ],
    shipping: {
      ...base.shipping,
      incoterm: "CIF",
      portOfDischarge: "Hamburg, Germany",
      freight: 2200,
      insurance: 320,
      shipDate: "2026-08-05",
      arrivalDate: "2026-08-22",
      vesselName: "MSC Adelina",
      containerNumber: "MSCU7788990",
    },
    bank: {
      name: "Commercial Bank of Egypt",
      accountName: "BucharestEgyAgro Import and Export",
      accountNumber: "0011223344",
      iban: "EG380019000500000000123456789",
      swift: "CIEGEGCXXXX",
    },
  };
  saveInvoices([inv]);
  return [inv];
}
