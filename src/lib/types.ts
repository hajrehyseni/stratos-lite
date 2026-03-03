import { z } from "zod";

export const AuditResultSchema = z.object({
  decision_type: z.enum([
    "Market Expansion", "Hiring", "Acquisition", "Fundraising",
    "Pivot", "Partnership", "Pricing", "Investment", "Operations", "Other"
  ]),
  confidence_score: z.number().min(0).max(100),
  confidence_reason: z.string(),
  verdict: z.enum(["Proceed", "Proceed with Caution", "Test First", "High Risk"]),
  biggest_risk: z.string(),
  hidden_assumption: z.string(),
  better_question: z.string(),
  thirty_day_test: z.string(),
  devils_argument: z.string(),
  assumptions: z.array(z.string()),
  risks_blind_spots: z.array(z.string()),
  information_needed: z.array(z.string()),
});

export type AuditResult = z.infer<typeof AuditResultSchema>;

export interface AuditData {
  id: string;
  decision: string;
  result: AuditResult;
  created_at: string;
}
