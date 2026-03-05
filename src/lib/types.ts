import { z } from "zod";

export const AuditResultSchema = z.object({
  confidence_score: z.number().min(0).max(100).transform(v => Math.round(v)),
  confidence_rationale: z.string().min(1),
  verdict: z.enum(["PROCEED", "CONDITIONAL PROCEED", "DO NOT PROCEED", "DEFER — INFORMATION NEEDED"]),
  biggest_risk: z.string().min(1),
  hidden_assumption: z.string().min(1),
  better_question: z.string().min(1),
  devils_advocate: z.string().min(1),
  stakeholder_gap: z.string().min(1),
  thirty_day_test: z.string().min(1),
  assumptions_to_validate: z.array(z.string()).min(1).transform(a => a.slice(0, 3)),
  risk_register: z.array(z.string()).min(1).transform(a => a.slice(0, 3)),
  information_needed: z.array(z.string()).min(1).transform(a => a.slice(0, 3)),
});

export type AuditResult = z.infer<typeof AuditResultSchema>;

export interface AuditData {
  id: string;
  decision: string;
  result: AuditResult;
  created_at: string;
}

export type FocusLens = 'risk' | 'speed' | 'board' | 'confidence';
export type DecisionScale = 'tactical' | 'operational' | 'strategic' | 'existential';

export interface DiagnosticAnswers {
  decision: string;
  focus?: FocusLens;
  scale?: DecisionScale;
  budget?: string;
  timeline?: string;
  constraint?: string;
}

export interface JournalEntry {
  id: string;
  decision: string;
  result: AuditResult;
  diagnostic?: DiagnosticAnswers;
  builtPrompt?: string;
  createdAt: string;
  followUp: boolean;
  outcome?: string;
  outcomeDate?: string;
}
