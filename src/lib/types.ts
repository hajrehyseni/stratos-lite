import { z } from "zod";

const StakeholderEntrySchema = z.object({
  role: z.string(),
  position: z.enum(["Support", "Oppose", "Neutral"]),
  influence: z.enum(["High", "Medium", "Low"]),
  action: z.string(),
});

const MeceBranchSchema = z.object({
  title: z.string(),
  findings: z.array(z.string()).min(2).max(3),
});

const StakeholderPerspectiveSchema = z.object({
  role: z.string(),
  stance: z.string(),
  ssm_role: z.enum(["problem_owner", "problem_solver", "client"]),
});

const CausalClusterSchema = z.object({
  name: z.string(),
  concepts: z.array(z.string()).min(1).max(4),
  key_link: z.string(),
});

const RecommendationSchema = z.object({
  action: z.string(),
  feasible: z.boolean(),
  agreed_by: z.string(),
  justification: z.string(),
});

export const AuditResultSchema = z.object({
  confidence_score: z.number().min(0).max(100).transform(v => Math.round(v)),
  verdict: z.enum(["PROCEED", "CONDITIONAL PROCEED", "DO NOT PROCEED", "DEFER — INFORMATION NEEDED"]),
  verdict_rationale: z.string().default(""),

  decision_domain: z.enum(["CLEAR", "COMPLICATED", "COMPLEX", "CHAOTIC"]).nullable().optional(),
  decision_domain_approach: z.string().nullable().optional(),

  reframe_question: z.string().default(""),

  mece_tree: z.object({
    branches: z.array(MeceBranchSchema).min(1).max(6),
  }).nullable().optional(),

  pre_mortem_narrative: z.string().nullable().optional(),

  time_horizon: z.object({
    ten_minutes: z.string(),
    ten_months: z.string(),
    ten_years: z.string(),
  }).nullable().optional(),

  rapid: z.object({
    recommend: z.string(),
    agree: z.string(),
    perform: z.string(),
    input: z.string(),
    decide: z.string(),
  }).nullable().optional(),

  second_order_chain: z.string().nullable().optional(),

  opportunity_cost: z.array(z.string()).max(2).nullable().optional(),

  stakeholder_map: z.array(StakeholderEntrySchema).nullable().optional(),

  biggest_risk: z.string().default(""),
  hidden_assumption: z.string().default(""),
  stakeholder_blind_spot: z.string().default(""),
  devils_advocate: z.string().default(""),
  validation_test_30_day: z.string().default(""),

  assumptions_to_validate: z.array(z.string()).max(3).default([]),
  risk_register: z.array(z.string()).max(3).default([]),
  information_needed: z.array(z.string()).max(3).default([]),

  // New SSM/SODA fields
  cynefin_domain: z.enum(["clear", "complicated", "complex", "chaotic"]).nullable().optional(),
  decision_classification: z.enum(["big_bet", "cross_cutting", "delegated"]).nullable().optional(),
  stakeholder_perspectives: z.array(StakeholderPerspectiveSchema).nullable().optional(),
  causal_clusters: z.array(CausalClusterSchema).nullable().optional(),
  second_order_effects: z.array(z.string()).nullable().optional(),
  recommendations: z.array(RecommendationSchema).nullable().optional(),

  // Legacy field aliases — keep backward compat for shared links
  confidence_rationale: z.string().optional(),
  better_question: z.string().optional(),
  stakeholder_gap: z.string().optional(),
  thirty_day_test: z.string().optional(),
});

export type AuditResult = z.infer<typeof AuditResultSchema>;

export interface AuditData {
  id: string;
  decision: string;
  result: AuditResult;
  created_at: string;
}

export type FocusLens = 'risk' | 'speed' | 'board' | 'confidence';
export type DecisionScale = 'team' | 'department' | 'company' | 'bet-the-company';

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
