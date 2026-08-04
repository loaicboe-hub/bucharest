import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { computeTotals, formatMoney, type Invoice } from "./admin-invoices";
import { getLogoDataUrl } from "./admin-branding";

const GREEN: [number, number, number] = [30, 86, 49];
const GOLD: [number, number, number] = [212, 175, 55];
const DARK: [number, number, number] = [30, 41, 59];
const MUTED: [number, number, number] = [100, 116, 139];

export async function generateInvoicePDF(inv: Invoice, mode: "save" | "print" = "save") {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const M = 40;
  const totals = computeTotals(inv);
  const cur = inv.info.currency;

  // Header band
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageW, 90, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 90, pageW, 3, "F");

  // Optional company logo (admin uploaded)
  let tx = M;
  const logo = await getLogoDataUrl();
  if (logo) {
    try {
      const fmt = logo.includes("image/jpeg") || logo.includes("image/jpg") ? "JPEG" : "PNG";
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(M, 18, 54, 54, 6, 6, "F");
      doc.addImage(logo, fmt, M + 5, 23, 44, 44, undefined, "FAST");
      tx = M + 68;
    } catch {
      tx = M;
    }
  }

  // Right block first so we know how much room the left block has
  const rightW = 200;
  const rightX = pageW - M;
  const leftMaxW = rightX - rightW - tx - 16;

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  const nameLines = doc.splitTextToSize(inv.exporter.company, leftMaxW) as string[];
  let ly = 34;
  nameLines.slice(0, 2).forEach((line) => {
    doc.text(line, tx, ly);
    ly += 17;
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const info = [
    `${inv.exporter.address}, ${inv.exporter.country}`,
    `${inv.exporter.phone}  •  ${inv.exporter.email}`,
    inv.exporter.website,
  ];
  info.forEach((line) => {
    if (ly > 86) return;
    doc.text(doc.splitTextToSize(line, leftMaxW)[0], tx, ly);
    ly += 11;
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("COMMERCIAL", rightX, 34, { align: "right" });
  doc.text("INVOICE", rightX, 51, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`No: ${inv.number}`, rightX, 67, { align: "right" });
  doc.text(`Date: ${inv.info.date}`, rightX, 79, { align: "right" });

  let y = 120;
  doc.setTextColor(...DARK);

  // Parties
  const colW = (pageW - M * 2 - 20) / 2;
  drawPartyBox(doc, M, y, colW, "EXPORTER / SELLER", [
    inv.exporter.company,
    inv.exporter.address,
    inv.exporter.country,
    `VAT: ${inv.exporter.vat}`,
    `CR: ${inv.exporter.commercialRegistration}`,
    `Tax #: ${inv.exporter.taxNumber}`,
  ]);
  drawPartyBox(doc, M + colW + 20, y, colW, "BUYER / CONSIGNEE", [
    inv.buyer.company,
    inv.buyer.contactPerson,
    inv.buyer.address,
    `${inv.buyer.city}${inv.buyer.postalCode ? " " + inv.buyer.postalCode : ""}, ${inv.buyer.country}`,
    inv.buyer.phone,
    inv.buyer.email,
    inv.buyer.vat ? `VAT: ${inv.buyer.vat}` : "",
  ]);
  y += 130;

  // Invoice / shipping meta strip
  const metaRows: [string, string][] = [
    ["Invoice Date", inv.info.date],
    ["Due Date", inv.info.dueDate],
    ["PO Number", inv.info.poNumber || "-"],
    ["Contract #", inv.info.contractNumber || "-"],
    ["Currency", inv.info.currency],
    ["Payment Terms", inv.info.paymentTerms || "-"],
    ["Incoterm", inv.shipping.incoterm],
    ["Port of Loading", inv.shipping.portOfLoading || "-"],
    ["Port of Discharge", inv.shipping.portOfDischarge || "-"],
    ["Ship Date", inv.shipping.shipDate || "-"],
    ["Arrival Date", inv.shipping.arrivalDate || "-"],
    ["Vessel / Container", `${inv.shipping.vesselName || "-"} / ${inv.shipping.containerNumber || "-"}`],
    ["Transportation", inv.shipping.transportation || "-"],
  ];
  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 8.5, cellPadding: 4, textColor: DARK },
    headStyles: { fillColor: GREEN, textColor: 255, fontStyle: "bold" },
    body: metaRows.reduce<string[][]>((acc, [k, v], i) => {
      if (i % 2 === 0) acc.push([k, v, "", ""]);
      else acc[acc.length - 1][2] = k, (acc[acc.length - 1][3] = v);
      return acc;
    }, []),
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [245, 248, 246], cellWidth: 90 },
      2: { fontStyle: "bold", fillColor: [245, 248, 246], cellWidth: 90 },
    },
    margin: { left: M, right: M },
  });
  // @ts-ignore
  y = doc.lastAutoTable.finalY + 16;

  // Products
  autoTable(doc, {
    startY: y,
    head: [["#", "Description", "HS Code", "Origin", "Qty", "Unit", "Unit Price", "Total"]],
    body: inv.lines.map((l, i) => [
      String(i + 1),
      `${l.name}${l.description ? "\n" + l.description : ""}`,
      l.hsCode || "-",
      l.origin || "-",
      String(l.quantity),
      l.unit,
      formatMoney(l.unitPrice, cur),
      formatMoney(l.quantity * l.unitPrice, cur),
    ]),
    theme: "striped",
    headStyles: { fillColor: GREEN, textColor: 255, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 5, textColor: DARK },
    columnStyles: {
      0: { cellWidth: 22, halign: "center" },
      4: { halign: "right", cellWidth: 40 },
      5: { halign: "center", cellWidth: 40 },
      6: { halign: "right", cellWidth: 70 },
      7: { halign: "right", cellWidth: 75, fontStyle: "bold" },
    },
    margin: { left: M, right: M },
  });
  // @ts-ignore
  y = doc.lastAutoTable.finalY + 12;

  // Totals block (right aligned)
  const totalsRows: [string, string, boolean?][] = [
    ["Subtotal", formatMoney(totals.subtotal, cur)],
    ["Freight", formatMoney(totals.freight, cur)],
    ["Insurance", formatMoney(totals.insurance, cur)],
    [
      inv.tax.mode === "vat"
        ? `VAT (${inv.tax.vatPercent}%)`
        : inv.tax.mode === "zero-rated"
          ? "VAT (Zero-Rated Export)"
          : "VAT (Exempt)",
      formatMoney(totals.taxAmount, cur),
    ],
    ["GRAND TOTAL", formatMoney(totals.grand, cur), true],
  ];
  const tW = 240;
  const tX = pageW - M - tW;
  autoTable(doc, {
    startY: y,
    body: totalsRows.map(([k, v]) => [k, v]),
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 5, textColor: DARK },
    columnStyles: {
      0: { cellWidth: 140, halign: "right" },
      1: { cellWidth: 100, halign: "right", fontStyle: "bold" },
    },
    margin: { left: tX, right: M },
    didParseCell: (data) => {
      if (data.row.index === totalsRows.length - 1) {
        data.cell.styles.fillColor = GREEN;
        data.cell.styles.textColor = 255;
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fontSize = 11;
      }
    },
  });
  // @ts-ignore
  y = doc.lastAutoTable.finalY + 18;

  // Bank + Notes side by side
  const half = (pageW - M * 2 - 16) / 2;
  drawSection(doc, M, y, half, "BANK DETAILS", [
    `Bank: ${inv.bank.name || "-"}`,
    `Account Name: ${inv.bank.accountName || "-"}`,
    `Account #: ${inv.bank.accountNumber || "-"}`,
    `IBAN: ${inv.bank.iban || "-"}`,
    `SWIFT: ${inv.bank.swift || "-"}`,
  ]);
  drawSection(doc, M + half + 16, y, half, "NOTES & DECLARATION", [
    inv.extras.notes,
    inv.extras.originStatement,
    inv.extras.declaration,
    inv.extras.additionalTerms,
  ].filter(Boolean));
  y += 130;

  // Signature
  if (y > 720) { doc.addPage(); y = 60; }
  doc.setDrawColor(...MUTED);
  doc.line(pageW - M - 200, y + 30, pageW - M, y + 30);
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("Authorized Signature & Stamp", pageW - M - 100, y + 44, { align: "center" });

  // Footer
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1);
  doc.line(M, 812, pageW - M, 812);
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    `${inv.exporter.company} • ISO 9001 Certified • Established 2011`,
    pageW / 2,
    826,
    { align: "center" },
  );

  if (mode === "print") {
    doc.autoPrint();
    const url = doc.output("bloburl");
    window.open(url as unknown as string, "_blank");
  } else {
    doc.save(`${inv.number}.pdf`);
  }
}

function drawPartyBox(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  title: string,
  lines: string[],
) {
  doc.setFillColor(...GREEN);
  doc.rect(x, y, w, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(title, x + 8, y + 12);
  doc.setDrawColor(220, 220, 220);
  doc.rect(x, y + 18, w, 110);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  let ly = y + 34;
  lines.filter(Boolean).forEach((l) => {
    doc.text(l, x + 8, ly, { maxWidth: w - 16 });
    ly += 12;
  });
}

function drawSection(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  title: string,
  lines: string[],
) {
  doc.setFillColor(245, 248, 246);
  doc.rect(x, y, w, 18, "F");
  doc.setTextColor(...GREEN);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(title, x + 8, y + 12);
  doc.setDrawColor(220, 220, 220);
  doc.rect(x, y + 18, w, 110);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  let ly = y + 32;
  lines.forEach((l) => {
    const wrapped = doc.splitTextToSize(l, w - 16);
    doc.text(wrapped, x + 8, ly);
    ly += wrapped.length * 10 + 2;
  });
}
