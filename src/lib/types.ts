import { z } from "zod";

export const AuditResultSchema = z.object({
  confidence_score: z.number().int().min(0).max(100),
  confidence_rationale: z.string().min(1).max(220),
  verdict: z.enum(["PROCEED", "CONDITIONAL PROCEED", "DO NOT PROCEED", "DEFER — INFORMATION NEEDED"]),
  biggest_risk: z.string().min(1).max(220),
  hidden_assumption: z.string().min(1).max(220),
  better_question: z.string().min(1).max(220),
  devils_advocate: z.string().min(1).max(320),
  stakeholder_gap: z.string().min(1).max(220),
  thirty_day_test: z.string().min(1).max(320),
  assumptions_to_validate: z.array(z.string().max(220)).min(1).max(3).default([]),
  risk_register: z.array(z.string().max(220)).min(1).max(3).default([]),
  information_needed: z.array(z.string().max(220)).min(1).max(3).default([]),
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
