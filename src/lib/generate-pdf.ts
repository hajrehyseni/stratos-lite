import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { AuditResult } from "./types";

export async function generatePDF(decision: string, result: AuditResult): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

  const gold = rgb(0.79, 0.66, 0.30);
  const black = rgb(0.03, 0.03, 0.03);
  const muted = rgb(0.5, 0.5, 0.5);
  const red = rgb(0.94, 0.27, 0.27);

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

  const reframe = result.reframe_question || result.better_question || "";
  const rationale = result.verdict_rationale || result.confidence_rationale || "";
  const blindSpot = result.stakeholder_blind_spot || result.stakeholder_gap || "";
  const test30 = result.validation_test_30_day || result.thirty_day_test || "";
  const cynefinDomain = result.cynefin_domain || (result.decision_domain ? result.decision_domain.toLowerCase() : null);

  // Header
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  page.drawText("DECISION AUDIT", { x: marginX, y, size: 16, font: helveticaBold, color: black });
  const dateW = helvetica.widthOfTextAtSize(dateStr, 9);
  page.drawText(dateStr, { x: pageW - marginX - dateW, y: y + 2, size: 9, font: helvetica, color: muted });
  y -= 16;
  page.drawText("London Royal Academy | StratOS", { x: marginX, y, size: 8, font: helvetica, color: muted });
  y -= 12;
  page.drawRectangle({ x: marginX, y, width: contentW, height: 1.5, color: gold });
  y -= 28;

  // Classification bar
  const classLabels: Record<string, string> = { big_bet: "BIG-BET", cross_cutting: "CROSS-CUTTING", delegated: "DELEGATED" };
  const classItems: string[] = [];
  if (cynefinDomain) classItems.push(`DOMAIN: ${cynefinDomain.toUpperCase()}`);
  if (result.decision_classification && classLabels[result.decision_classification]) classItems.push(classLabels[result.decision_classification]);
  classItems.push(`SCORE: ${result.confidence_score}/100`);
  page.drawText(classItems.join("  |  "), { x: marginX, y, size: 9, font: helveticaBold, color: gold });
  y -= 14;
  if (result.decision_domain_approach) {
    for (const line of wrapText(result.decision_domain_approach, 80)) {
      page.drawText(line, { x: marginX, y, size: 8, font: helvetica, color: muted });
      y -= 12;
    }
  }
  y -= 14;

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
  y -= 14;
  if (rationale) {
    for (const line of wrapText(rationale, 80)) {
      checkPage(13);
      page.drawText(line, { x: marginX, y, size: 8, font: helvetica, color: muted });
      y -= 12;
    }
  }
  y -= 14;

  // Reframe
  if (reframe) {
    checkPage(40);
    page.drawText("THE REFRAME", { x: marginX, y, size: 7, font: helveticaBold, color: gold });
    y -= 14;
    for (const line of wrapText(`"${reframe}"`, 78)) {
      checkPage(13);
      page.drawText(line, { x: marginX, y, size: 10, font: helveticaOblique, color: black });
      y -= 14;
    }
    y -= 14;
  }

  // Time Horizon
  if (result.time_horizon) {
    checkPage(60);
    page.drawRectangle({ x: marginX, y, width: contentW, height: 0.5, color: gold });
    y -= 18;
    page.drawText("TIME HORIZON", { x: marginX, y, size: 7, font: helveticaBold, color: gold });
    y -= 16;
    for (const [label, value] of [["10 Minutes", result.time_horizon.ten_minutes], ["10 Months", result.time_horizon.ten_months], ["10 Years", result.time_horizon.ten_years]] as const) {
      checkPage(28);
      page.drawText(label.toUpperCase(), { x: marginX, y, size: 7, font: helveticaBold, color: muted });
      y -= 12;
      for (const line of wrapText(value, 80)) {
        checkPage(12);
        page.drawText(line, { x: marginX, y, size: 9, font: helvetica, color: black });
        y -= 12;
      }
      y -= 8;
    }
    y -= 6;
  }

  // Stakeholder Perspectives
  if (result.stakeholder_perspectives?.length) {
    checkPage(40);
    page.drawRectangle({ x: marginX, y, width: contentW, height: 0.5, color: gold });
    y -= 18;
    page.drawText("STAKEHOLDER PERSPECTIVES", { x: marginX, y, size: 7, font: helveticaBold, color: gold });
    y -= 16;
    const ssmLabels: Record<string, string> = { problem_owner: "Problem Owner", problem_solver: "Problem Solver", client: "Client" };
    for (const s of result.stakeholder_perspectives) {
      checkPage(28);
      page.drawText(`${s.role} (${ssmLabels[s.ssm_role] || s.ssm_role})`, { x: marginX, y, size: 10, font: helveticaBold, color: black });
      y -= 14;
      for (const line of wrapText(s.stance, 78)) {
        checkPage(12);
        page.drawText(line, { x: marginX + 8, y, size: 9, font: helvetica, color: muted });
        y -= 12;
      }
      y -= 6;
    }
    y -= 6;
  }

  // Causal Clusters
  if (result.causal_clusters?.length) {
    checkPage(40);
    page.drawRectangle({ x: marginX, y, width: contentW, height: 0.5, color: gold });
    y -= 18;
    page.drawText("CAUSAL CLUSTERS", { x: marginX, y, size: 7, font: helveticaBold, color: gold });
    y -= 16;
    for (const cluster of result.causal_clusters) {
      checkPage(30);
      page.drawText(cluster.name, { x: marginX, y, size: 10, font: helveticaBold, color: black });
      y -= 14;
      for (const concept of cluster.concepts) {
        for (const line of wrapText(`• ${concept}`, 76)) {
          checkPage(13);
          page.drawText(line, { x: marginX + 8, y, size: 9, font: helvetica, color: black });
          y -= 12;
        }
      }
      for (const line of wrapText(cluster.key_link, 76)) {
        checkPage(12);
        page.drawText(line, { x: marginX + 8, y, size: 8, font: helveticaOblique, color: muted });
        y -= 12;
      }
      y -= 8;
    }
    y -= 6;
  }

  // MECE Tree
  if (result.mece_tree?.branches?.length) {
    checkPage(40);
    page.drawRectangle({ x: marginX, y, width: contentW, height: 0.5, color: gold });
    y -= 18;
    page.drawText("STRUCTURED ANALYSIS (MECE)", { x: marginX, y, size: 7, font: helveticaBold, color: gold });
    y -= 16;
    for (const branch of result.mece_tree.branches) {
      checkPage(30);
      page.drawText(branch.title, { x: marginX, y, size: 10, font: helveticaBold, color: black });
      y -= 14;
      for (const finding of branch.findings) {
        for (const line of wrapText(`• ${finding}`, 76)) {
          checkPage(13);
          page.drawText(line, { x: marginX + 8, y, size: 9, font: helvetica, color: black });
          y -= 12;
        }
      }
      y -= 8;
    }
    y -= 6;
  }

  // Risk Surface
  page.drawRectangle({ x: marginX, y, width: contentW, height: 0.5, color: gold });
  y -= 18;
  const riskFields: [string, string][] = [
    ["Biggest Risk", result.biggest_risk],
    ["Hidden Assumption", result.hidden_assumption],
    ["Stakeholder Blind Spot", blindSpot],
  ];
  for (const [label, value] of riskFields) {
    if (!value) continue;
    checkPage(50);
    page.drawText(label.toUpperCase(), { x: marginX, y, size: 7, font: helveticaBold, color: gold });
    y -= 14;
    for (const line of wrapText(value, 80)) {
      checkPage(13);
      page.drawText(line, { x: marginX, y, size: 9, font: helvetica, color: black });
      y -= 13;
    }
    y -= 14;
  }

  // Pre-Mortem
  if (result.pre_mortem_narrative) {
    checkPage(50);
    page.drawText("PRE-MORTEM: THE FAILURE SCENARIO", { x: marginX, y, size: 7, font: helveticaBold, color: red });
    y -= 14;
    for (const line of wrapText(result.pre_mortem_narrative, 78)) {
      checkPage(13);
      page.drawText(line, { x: marginX, y, size: 9, font: helveticaOblique, color: black });
      y -= 13;
    }
    y -= 14;
  }

  // Second Order Effects (new array)
  if (result.second_order_effects?.length) {
    checkPage(40);
    page.drawRectangle({ x: marginX, y, width: contentW, height: 0.5, color: gold });
    y -= 18;
    page.drawText("CHAIN REACTIONS", { x: marginX, y, size: 7, font: helveticaBold, color: gold });
    y -= 14;
    for (const effect of result.second_order_effects) {
      for (const line of wrapText(`→ ${effect}`, 78)) {
        checkPage(13);
        page.drawText(line, { x: marginX, y, size: 9, font: helvetica, color: black });
        y -= 13;
      }
      y -= 4;
    }
    y -= 10;
  }

  // Recommendations
  if (result.recommendations?.length) {
    checkPage(40);
    page.drawRectangle({ x: marginX, y, width: contentW, height: 0.5, color: gold });
    y -= 18;
    page.drawText("RECOMMENDED ACTIONS", { x: marginX, y, size: 7, font: helveticaBold, color: gold });
    y -= 16;
    for (const rec of result.recommendations) {
      if (!rec.feasible) continue;
      checkPage(40);
      page.drawText(rec.action, { x: marginX, y, size: 10, font: helveticaBold, color: black });
      y -= 14;
      page.drawText(`Agreed by: ${rec.agreed_by}`, { x: marginX + 8, y, size: 8, font: helvetica, color: muted });
      y -= 12;
      for (const line of wrapText(rec.justification, 76)) {
        checkPage(12);
        page.drawText(line, { x: marginX + 8, y, size: 9, font: helvetica, color: black });
        y -= 12;
      }
      y -= 10;
    }
    y -= 6;
  }

  // RAPID
  if (result.rapid) {
    checkPage(80);
    page.drawRectangle({ x: marginX, y, width: contentW, height: 0.5, color: gold });
    y -= 18;
    page.drawText("DECISION ACCOUNTABILITY (RAPID)", { x: marginX, y, size: 7, font: helveticaBold, color: gold });
    y -= 16;
    for (const [letter, value] of [["R — Recommend", result.rapid.recommend], ["A — Agree", result.rapid.agree], ["P — Perform", result.rapid.perform], ["I — Input", result.rapid.input], ["D — Decide", result.rapid.decide]] as const) {
      checkPage(20);
      page.drawText(letter, { x: marginX, y, size: 8, font: helveticaBold, color: gold });
      page.drawText(value, { x: marginX + 100, y, size: 9, font: helvetica, color: black });
      y -= 16;
    }
    y -= 8;
  }

  // Second Order (legacy)
  if (!result.second_order_effects?.length && result.second_order_chain) {
    checkPage(40);
    page.drawRectangle({ x: marginX, y, width: contentW, height: 0.5, color: gold });
    y -= 18;
    page.drawText("SECOND-ORDER EFFECTS", { x: marginX, y, size: 7, font: helveticaBold, color: gold });
    y -= 14;
    for (const line of wrapText(result.second_order_chain, 80)) {
      checkPage(13);
      page.drawText(line, { x: marginX, y, size: 9, font: helvetica, color: black });
      y -= 13;
    }
    y -= 14;
  }

  // Opportunity Cost
  if (result.opportunity_cost?.length) {
    checkPage(40);
    page.drawText("OPPORTUNITY COST", { x: marginX, y, size: 7, font: helveticaBold, color: gold });
    y -= 14;
    for (const cost of result.opportunity_cost) {
      for (const line of wrapText(`• ${cost}`, 78)) {
        checkPage(13);
        page.drawText(line, { x: marginX + 4, y, size: 9, font: helvetica, color: black });
        y -= 13;
      }
    }
    y -= 14;
  }

  // Stakeholder Map
  if (result.stakeholder_map?.length) {
    checkPage(40);
    page.drawText("STAKEHOLDER MAP", { x: marginX, y, size: 7, font: helveticaBold, color: gold });
    y -= 16;
    for (const s of result.stakeholder_map) {
      checkPage(16);
      page.drawText(`${s.role} — ${s.position} (${s.influence})`, { x: marginX, y, size: 9, font: helveticaBold, color: black });
      y -= 12;
      for (const line of wrapText(s.action, 78)) {
        checkPage(12);
        page.drawText(line, { x: marginX + 8, y, size: 8, font: helvetica, color: muted });
        y -= 12;
      }
      y -= 6;
    }
    y -= 8;
  }

  // Deep dive
  page.drawRectangle({ x: marginX, y, width: contentW, height: 0.5, color: gold });
  y -= 24;

  const deepFields: [string, string][] = [
    ["Devil's Advocate", result.devils_advocate],
    ["30-Day Validation Test", test30],
  ];
  for (const [label, value] of deepFields) {
    if (!value) continue;
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
