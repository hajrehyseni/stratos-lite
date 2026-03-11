import type { AuditResult } from "./types";

export function generateBrief(decision: string, result: AuditResult): string {
  const reframe = result.reframe_question || result.better_question || "";
  const rationale = result.verdict_rationale || result.confidence_rationale || "";
  const blindSpot = result.stakeholder_blind_spot || result.stakeholder_gap || "";
  const test30 = result.validation_test_30_day || result.thirty_day_test || "";

  let brief = `DECISION AUDIT — StratOS
London Royal Academy
${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DECISION READINESS SCORE: ${result.confidence_score}/100`;

  if (result.decision_domain) brief += `\nDOMAIN: ${result.decision_domain}`;
  if (rationale) brief += `\n${rationale}`;

  brief += `

DECISION:
${decision}

VERDICT: ${result.verdict}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  if (reframe) brief += `\n\nTHE REFRAME:\n"${reframe}"`;

  if (result.time_horizon) {
    brief += `\n\nTIME HORIZON:
⏱ 10 minutes: ${result.time_horizon.ten_minutes}
📅 10 months: ${result.time_horizon.ten_months}
🏛 10 years: ${result.time_horizon.ten_years}`;
  }

  if (result.mece_tree?.branches?.length) {
    brief += `\n\n━━━ STRUCTURED ANALYSIS (MECE) ━━━`;
    for (const branch of result.mece_tree.branches) {
      brief += `\n\n${branch.title}`;
      for (const f of branch.findings) brief += `\n• ${f}`;
    }
  }

  brief += `\n\n━━━ STRATEGIC RISK SURFACE ━━━`;
  if (result.biggest_risk) brief += `\n\nBIGGEST RISK:\n${result.biggest_risk}`;
  if (result.hidden_assumption) brief += `\n\nHIDDEN ASSUMPTION:\n${result.hidden_assumption}`;
  if (blindSpot) brief += `\n\nSTAKEHOLDER BLIND SPOT:\n${blindSpot}`;

  if (result.pre_mortem_narrative) brief += `\n\nPRE-MORTEM:\n${result.pre_mortem_narrative}`;

  if (result.rapid) {
    brief += `\n\n━━━ DECISION ACCOUNTABILITY (RAPID) ━━━
R — Recommend: ${result.rapid.recommend}
A — Agree: ${result.rapid.agree}
P — Perform: ${result.rapid.perform}
I — Input: ${result.rapid.input}
D — Decide: ${result.rapid.decide}`;
  }

  if (result.second_order_chain) brief += `\n\nSECOND-ORDER EFFECTS:\n${result.second_order_chain}`;

  if (result.opportunity_cost?.length) {
    brief += `\n\nOPPORTUNITY COST:`;
    for (const c of result.opportunity_cost) brief += `\n• ${c}`;
  }

  if (result.stakeholder_map?.length) {
    brief += `\n\nSTAKEHOLDER MAP:`;
    for (const s of result.stakeholder_map) {
      brief += `\n• ${s.role} (${s.position}, ${s.influence}) — ${s.action}`;
    }
  }

  brief += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  if (result.devils_advocate) brief += `\n\nDEVIL'S ADVOCATE:\n${result.devils_advocate}`;
  if (test30) brief += `\n\n30-DAY VALIDATION TEST:\n${test30}`;

  if (result.assumptions_to_validate?.length) {
    brief += `\n\nASSUMPTIONS TO VALIDATE:\n${result.assumptions_to_validate.map(a => `• ${a}`).join("\n")}`;
  }
  if (result.risk_register?.length) {
    brief += `\n\nRISK REGISTER:\n${result.risk_register.map(r => `• ${r}`).join("\n")}`;
  }
  if (result.information_needed?.length) {
    brief += `\n\nINFORMATION NEEDED:\n${result.information_needed.map(i => `• ${i}`).join("\n")}`;
  }

  brief += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nConfidential — Prepared by StratOS | ai.londonra.com`;

  return brief;
}
