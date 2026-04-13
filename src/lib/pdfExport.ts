import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

const PURPLE = [124, 58, 237] as const;
const ORANGE = [234, 108, 72] as const;
const GREEN = [34, 165, 105] as const;
const GRAY = [120, 120, 130] as const;

function addHeader(doc: jsPDF, title: string, subtitle?: string): number {
  doc.setFillColor(PURPLE[0], PURPLE[1], PURPLE[2]);
  doc.rect(0, 0, 210, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("HisabKitab", 14, 14);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(title, 14, 22);

  if (subtitle) {
    doc.setFontSize(8);
    doc.text(subtitle, 14, 28);
  }

  doc.setFontSize(7);
  doc.setTextColor(220, 220, 255);
  doc.text(`Generated: ${format(new Date(), "dd MMM yyyy, hh:mm a")}`, 210 - 14, 28, { align: "right" });

  doc.setTextColor(0, 0, 0);
  return 40;
}

function getFinalY(doc: jsPDF): number {
  return (doc as any).lastAutoTable?.finalY ?? 40;
}

/**
 * Save PDF — on native mobile uses Capacitor Filesystem + Share,
 * on web falls back to browser download.
 */
async function savePDF(doc: jsPDF, filename: string) {
  if (Capacitor.isNativePlatform()) {
    try {
      const base64 = doc.output("datauristring").split(",")[1];
      const result = await Filesystem.writeFile({
        path: filename,
        data: base64,
        directory: Directory.Cache,
      });

      await Share.share({
        title: filename,
        url: result.uri,
        dialogTitle: "Save or Share PDF",
      });
    } catch (err) {
      console.error("Native PDF save error:", err);
      // Fallback to browser download
      doc.save(filename);
    }
  } else {
    doc.save(filename);
  }
}

export async function exportExpensesPDF(
  expenses: { amount: number; category: string; note: string | null; expense_date: string }[],
  monthLabel: string,
  total: number
) {
  const doc = new jsPDF();
  let y = addHeader(doc, "Expense Report", monthLabel);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(PURPLE[0], PURPLE[1], PURPLE[2]);
  doc.text(`Total Expenses: Rs.${total.toLocaleString("en-IN")}`, 14, y);
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
  doc.setFontSize(8);
  doc.text(`${expenses.length} entries`, 14, y + 5);
  y += 12;

  const catMap: Record<string, number> = {};
  expenses.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + e.amount; });
  const catData = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  if (catData.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Category", "Amount", "% of Total"]],
      body: catData.map(([cat, amt]) => [
        cat,
        `Rs.${amt.toLocaleString("en-IN")}`,
        `${((amt / total) * 100).toFixed(1)}%`,
      ]),
      headStyles: { fillColor: [...PURPLE], fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 245, 255] },
      margin: { left: 14, right: 14 },
    });
    y = getFinalY(doc) + 8;
  }

  autoTable(doc, {
    startY: y,
    head: [["Date", "Category", "Note", "Amount"]],
    body: expenses.map(e => [
      format(new Date(e.expense_date), "dd MMM yyyy"),
      e.category,
      e.note || "-",
      `Rs.${e.amount.toLocaleString("en-IN")}`,
    ]),
    headStyles: { fillColor: [...ORANGE], fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [255, 248, 245] },
    columnStyles: { 3: { halign: "right" as const, fontStyle: "bold" as const } },
    margin: { left: 14, right: 14 },
  });

  await savePDF(doc, `expenses-${monthLabel.replace(/\s/g, "-").toLowerCase()}.pdf`);
}

export async function exportIncomePDF(
  incomes: { amount: number; source: string; note: string | null; income_date: string }[],
  monthLabel: string,
  total: number
) {
  const doc = new jsPDF();
  let y = addHeader(doc, "Income Report", monthLabel);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.text(`Total Income: Rs.${total.toLocaleString("en-IN")}`, 14, y);
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
  doc.setFontSize(8);
  doc.text(`${incomes.length} entries`, 14, y + 5);
  y += 12;

  const srcMap: Record<string, number> = {};
  incomes.forEach(i => { srcMap[i.source] = (srcMap[i.source] || 0) + i.amount; });
  const srcData = Object.entries(srcMap).sort((a, b) => b[1] - a[1]);

  if (srcData.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Source", "Amount", "% of Total"]],
      body: srcData.map(([src, amt]) => [
        src,
        `Rs.${amt.toLocaleString("en-IN")}`,
        `${((amt / total) * 100).toFixed(1)}%`,
      ]),
      headStyles: { fillColor: [...GREEN], fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 255, 248] },
      margin: { left: 14, right: 14 },
    });
    y = getFinalY(doc) + 8;
  }

  autoTable(doc, {
    startY: y,
    head: [["Date", "Source", "Note", "Amount"]],
    body: incomes.map(i => [
      format(new Date(i.income_date), "dd MMM yyyy"),
      i.source,
      i.note || "-",
      `Rs.${i.amount.toLocaleString("en-IN")}`,
    ]),
    headStyles: { fillColor: [...PURPLE], fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 245, 255] },
    columnStyles: { 3: { halign: "right" as const, fontStyle: "bold" as const } },
    margin: { left: 14, right: 14 },
  });

  await savePDF(doc, `income-${monthLabel.replace(/\s/g, "-").toLowerCase()}.pdf`);
}

export async function exportDebtLedgerPDF(
  personName: string,
  entries: { amount: number; type: "given" | "taken"; status: "pending" | "paid"; note: string | null; due_date: string | null; created_at: string }[],
  summary: { given: number; taken: number; net: number }
) {
  const doc = new jsPDF();
  const netLabel = summary.net >= 0 ? "They owe you" : "You owe them";
  let y = addHeader(doc, `Debt Ledger — ${personName}`, `Net: ${netLabel} Rs.${Math.abs(summary.net).toLocaleString("en-IN")}`);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(PURPLE[0], PURPLE[1], PURPLE[2]);
  doc.text(`Total Given: Rs.${summary.given.toLocaleString("en-IN")}`, 14, y);
  doc.setTextColor(ORANGE[0], ORANGE[1], ORANGE[2]);
  doc.text(`Total Taken: Rs.${summary.taken.toLocaleString("en-IN")}`, 100, y);
  y += 6;

  const netColor = summary.net >= 0 ? GREEN : ORANGE;
  doc.setFontSize(11);
  doc.setTextColor(netColor[0], netColor[1], netColor[2]);
  doc.text(`Net Balance: ${summary.net >= 0 ? "+" : "-"}Rs.${Math.abs(summary.net).toLocaleString("en-IN")}`, 14, y);
  y += 10;

  const sorted = [...entries].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  let runBal = 0;
  const rows = sorted.map(e => {
    if (e.status !== "paid") {
      if (e.type === "given") runBal += e.amount;
      else runBal -= e.amount;
    }
    return [
      format(new Date(e.created_at), "dd MMM yyyy"),
      e.type === "given" ? "Given" : "Taken",
      e.status === "paid" ? "Settled" : "Pending",
      e.note || "-",
      e.due_date ? format(new Date(e.due_date), "dd MMM") : "-",
      `Rs.${e.amount.toLocaleString("en-IN")}`,
      `Rs.${Math.abs(runBal).toLocaleString("en-IN")}`,
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [["Date", "Type", "Status", "Note", "Due", "Amount", "Balance"]],
    body: rows,
    headStyles: { fillColor: [...PURPLE], fontSize: 7, fontStyle: "bold" },
    bodyStyles: { fontSize: 7 },
    alternateRowStyles: { fillColor: [248, 245, 255] },
    columnStyles: {
      1: { fontStyle: "bold" as const },
      5: { halign: "right" as const, fontStyle: "bold" as const },
      6: { halign: "right" as const },
    },
    didParseCell: (data: any) => {
      if (data.section === "body" && data.column.index === 1) {
        data.cell.styles.textColor = data.cell.raw === "Given" ? [200, 120, 0] : [40, 120, 200];
      }
      if (data.section === "body" && data.column.index === 2) {
        data.cell.styles.textColor = data.cell.raw === "Settled" ? [...GREEN] : [...GRAY];
      }
    },
    margin: { left: 14, right: 14 },
  });

  await savePDF(doc, `ledger-${personName.replace(/\s/g, "-").toLowerCase()}.pdf`);
}
