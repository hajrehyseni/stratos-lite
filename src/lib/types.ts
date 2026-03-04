import { z } from "zod";

export const AuditResultSchema = z.object({
  decision_type: z.string().min(1).max(60),
  confidence_score: z.number().int().min(0).max(100),
  confidence_rationale: z.string().min(1).max(200),
  verdict: z.enum(["Proceed", "Proceed with Caution", "Test First", "High Risk"]),
  biggest_risk: z.string().min(1).max(200),
  hidden_assumption: z.string().min(1).max(200),
  better_question: z.string().min(1).max(200),
  devils_argument: z.string().min(1).max(400),
  stakeholder_gap: z.string().min(1).max(200),
  thirty_day_test: z.string().min(1).max(400),
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
  focus: FocusLens;
  scale: DecisionScale;
  budget?: string;
  timeline?: string;
  constraint?: string;
}

export interface JournalEntry {
  id: string;
  decision: string;
  result: AuditResult;
  diagnostic: DiagnosticAnswers;
  builtPrompt: string;
  createdAt: string;
  followUp: boolean;
  outcome?: string;
  outcomeDate?: string;
}
