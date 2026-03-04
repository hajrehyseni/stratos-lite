import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { AuditResult } from "./types";

export async function generatePDF(decision: string, result: AuditResult): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const gold = rgb(0.79, 0.66, 0.30);
  const black = rgb(0.03, 0.03, 0.03);
  const textColor = rgb(0.91, 0.89, 0.87);
  const muted = rgb(0.5, 0.5, 0.5);
  const white = rgb(1, 1, 1);

  // A4: 595 x 842 pts, 25mm margins ≈ 71pts
  const marginX = 71;
  const marginTop = 71;
  const pageW = 595;
  const pageH = 842;
  const contentW = pageW - marginX * 2;

  let page = doc.addPage([pageW, pageH]);
  let y = pageH - marginTop;

  function addFooter(p: typeof page) {
    p.drawText("Confidential — Prepared by StratOS | ai.londonra.com", {
      x: marginX, y: 30, size: 7, font: helvetica, color: muted,
    });
    const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    p.drawText(dateStr, { x: pageW - marginX - 80, y: 30, size: 7, font: helvetica, color: muted });
  }

  function checkPage(needed: number) {
    if (y - needed < 60) {
      addFooter(page);
      page = doc.addPage([pageW, pageH]);
      y = pageH - marginTop;
    }
  }

  // Header
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  page.drawText("DECISION AUDIT", { x: marginX, y, size: 16, font: helveticaBold, color: black });
  const dateW = helvetica.widthOfTextAtSize(dateStr, 9);
  page.drawText(dateStr, { x: pageW - marginX - dateW, y: y + 2, size: 9, font: helvetica, color: muted });
  y -= 16;

  page.drawText("London Royal Academy | StratOS", { x: marginX, y, size: 8, font: helvetica, color: muted });
  y -= 12;

  // Gold separator
  page.drawRectangle({ x: marginX, y, width: contentW, height: 1.5, color: gold });
  y -= 28;

  // Decision Readiness Score
  page.drawText("DECISION READINESS SCORE", { x: marginX, y, size: 9, font: helveticaBold, color: gold });
  y -= 28;
  page.drawText(`${result.confidence_score}/100`, { x: marginX, y, size: 32, font: helveticaBold, color: black });
  y -= 14;
  page.drawText(result.confidence_rationale, { x: marginX, y, size: 8, font: helvetica, color: muted });
  y -= 28;

  // Decision text
  page.drawText("DECISION", { x: marginX, y, size: 7, font: helveticaBold, color: muted });
  y -= 14;
  for (const line of wrapText(decision, 75)) {
    checkPage(14);
    page.drawText(line, { x: marginX, y, size: 10, font: helvetica, color: black });
    y -= 14;
  }
  y -= 16;

  // Verdict
  page.drawText(`VERDICT: ${result.verdict}`, { x: marginX, y, size: 13, font: helveticaBold, color: black });
  y -= 28;

  // Separator
  page.drawRectangle({ x: marginX, y, width: contentW, height: 0.5, color: gold });
  y -= 24;

  // Content sections
  const fields: [string, string][] = [
    ["Biggest Risk", result.biggest_risk],
    ["Hidden Assumption", result.hidden_assumption],
    ["The Question You Should Be Asking", result.better_question],
    ["Devil's Advocate", result.devils_advocate],
    ["Stakeholder Blind Spot", result.stakeholder_gap],
    ["30-Day Validation Test", result.thirty_day_test],
  ];

  for (const [label, value] of fields) {
    checkPage(50);
    page.drawText(label.toUpperCase(), { x: marginX, y, size: 7, font: helveticaBold, color: gold });
    y -= 14;
    for (const line of wrapText(value, 80)) {
      checkPage(14);
      page.drawText(line, { x: marginX, y, size: 9, font: helvetica, color: black });
      y -= 13;
    }
    y -= 14;
  }

  // List sections
  const lists: [string, string[]][] = [
    ["Assumptions to Validate", result.assumptions_to_validate || []],
    ["Risk Register", result.risk_register || []],
    ["Information Needed", result.information_needed || []],
  ];

  for (const [label, items] of lists) {
    if (items.length === 0) continue;
    checkPage(40);
    page.drawText(label.toUpperCase(), { x: marginX, y, size: 7, font: helveticaBold, color: gold });
    y -= 14;
    for (const item of items) {
      for (const line of wrapText(`• ${item}`, 78)) {
        checkPage(13);
        page.drawText(line, { x: marginX + 4, y, size: 9, font: helvetica, color: black });
        y -= 13;
      }
    }
    y -= 14;
  }

  addFooter(page);

  return doc.save();
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars) {
      lines.push(current.trim());
      current = word;
    } else {
      current += " " + word;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}
