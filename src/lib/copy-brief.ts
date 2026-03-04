import type { AuditResult } from "./types";

export function generateBrief(decision: string, result: AuditResult): string {
  let brief = `DECISION AUDIT — StratOS
London Royal Academy
${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DECISION READINESS SCORE: ${result.confidence_score}/100
${result.confidence_rationale}

DECISION:
${decision}

VERDICT: ${result.verdict}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BIGGEST RISK:
${result.biggest_risk}

HIDDEN ASSUMPTION:
${result.hidden_assumption}

THE QUESTION YOU SHOULD BE ASKING:
${result.better_question}

DEVIL'S ADVOCATE:
${result.devils_advocate}

STAKEHOLDER BLIND SPOT:
${result.stakeholder_gap}

30-DAY VALIDATION TEST:
${result.thirty_day_test}`;

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
