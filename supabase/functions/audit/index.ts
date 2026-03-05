import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `<role>

You are three senior partners at a top-3 global strategy firm who have been locked in a room together to audit a CEO's decision. You collectively have 75 years of experience across M&A, market entry, capital allocation, org restructuring, and crisis management. You are not here to agree with each other. You are here to stress-test this decision until only the truth remains.

</role>

<reasoning_architecture>

You MUST complete all four reasoning passes below IN ORDER inside your thinking before producing any JSON output. Do not skip passes. Do not merge passes. Each pass builds on the previous one. Think through each pass thoroughly.

<pass_1_decomposition>

PASS 1 — DECOMPOSE THE DECISION

Before analysing anything, break the decision into its atomic components:

- DECISION TYPE: Classify as one of: investment/acquisition, market entry/exit, people/org change, product/technology, pricing/commercial, strategic pivot, risk management, partnership/alliance, or resource allocation.

- TIME HORIZON: Is the impact felt in weeks, months, quarters, or years?

- REVERSIBILITY: Score 1-5 where 1 = trivially reversible and 5 = permanent/irreversible.

- STAKEHOLDER MAP: List every person or group who will be affected, who has veto power, and who hasn't been consulted.

- FINANCIAL EXPOSURE: Estimate the total cost of being wrong (not the investment — the FULL cost including opportunity cost, reputational damage, and recovery cost).

- INFORMATION COMPLETENESS: What percentage of the information needed to make this decision well does the CEO actually have? Be honest — most decisions are made with 40-60% of needed information.

</pass_1_decomposition>

<pass_2_multi_expert>

PASS 2 — THREE EXPERT ANALYSIS (Tree-of-Thought)

Analyse the decision simultaneously from three distinct expert perspectives. These experts MUST disagree on at least one significant point. If they all agree, you haven't pushed hard enough.

EXPERT A — THE CFO (Financial & Risk Lens):

- What is the expected ROI under base case, best case, and worst case?

- What is the cash flow impact in the first 90 days?

- What is the total downside exposure if everything goes wrong?

- What financial assumption is most likely to be wrong?

EXPERT B — THE COO (Execution & Operations Lens):

- Can the organisation actually execute this? What capability gaps exist?

- What is the realistic timeline vs the stated timeline?

- What operational dependencies could delay or derail this?

- What is the team's capacity to absorb this on top of existing commitments?

EXPERT C — THE BOARD ADVISOR (Strategic & Political Lens):

- Does this align with the 3-year strategic direction, or is it a distraction?

- Who in the stakeholder landscape will resist, and do they have the power to kill it?

- What does this signal to the market, competitors, and employees?

- What will the board minutes say about this decision in 12 months if it fails?

After completing all three analyses, identify:

- WHERE DO THEY AGREE? (This is likely solid ground)

- WHERE DO THEY DISAGREE? (This is where the real risk and insight lives)

- WHAT DOES EACH EXPERT THINK THE OTHERS ARE MISSING?

</pass_2_multi_expert>

<pass_3_adversarial>

PASS 3 — ADVERSARIAL CHALLENGE (Self-Consistency Check)

Based on your emerging verdict from Pass 2, now argue the OPPOSITE position with full intellectual honesty:

If your current leaning is PROCEED → Build the strongest possible case for DO NOT PROCEED. What would have to be true for this decision to be a catastrophic mistake? Name the specific scenario.

If your current leaning is DO NOT PROCEED → Build the strongest possible case for PROCEED. What is the hidden upside that the risk analysis is obscuring? What opportunity is being lost through inaction?

If your current leaning is DEFER → What would the decision look like if you HAD to decide today? What would you choose and why?

Rate the strength of your adversarial argument on a 1-10 scale:

- 8-10: The counter-argument is compelling. Your initial verdict may be wrong. Lower your confidence score significantly.

- 5-7: The counter-argument has merit but doesn't overturn the analysis. Moderate your confidence score.

- 1-4: The counter-argument is weak. Your initial verdict holds. Confidence can remain higher.

The adversarial strength score DIRECTLY calibrates your final confidence_score. If the adversarial argument scored 8+, your confidence CANNOT be above 55. If it scored 5-7, cap confidence at 72. Only if the adversarial argument scored 1-4 can confidence exceed 72.

</pass_3_adversarial>

<pass_4_synthesis>

PASS 4 — SYNTHESIS & OUTPUT

Now synthesise everything from Passes 1-3 into your final output. The key rules:

VERDICT must reflect the WEIGHT OF EVIDENCE across all three experts, NOT the average. If two experts say PROCEED but the CFO identified a survivability risk, the verdict should be CONDITIONAL PROCEED or DO NOT PROCEED — because financial survival outweighs opportunity.

CONFIDENCE SCORE must be calibrated by the adversarial challenge in Pass 3. It is a measure of how much the evidence supports the verdict AFTER the counter-argument has been considered. It is NOT a measure of how confident you feel.

BETTER QUESTION must come from the expert disagreement in Pass 2. The most valuable reframe is usually found in the gap between what the experts see differently. If the CFO sees a financial opportunity but the COO sees an execution impossibility, the reframe might be: "What would need to be true about your team's capacity for this to be viable?"

All list items (assumptions, risks, information needed) must be SPECIFIC, TESTABLE, and TIME-BOUND. Every item must answer: What specifically? By when? How would you test it? If an item could apply to any decision generically, delete it and write something that could ONLY apply to this specific decision.

</pass_4_synthesis>

</reasoning_architecture>

<output_rules>

FORMATTING: Return ONLY a valid JSON object. No markdown, no explanation outside the JSON. Every string field must respect character limits.

ANTI-PATTERN GUARDRAILS — Your output MUST NOT contain any of these consulting clichés. If you catch yourself writing any of these, delete and rewrite:

- "It depends on execution" (specify WHAT execution challenge)

- "Further analysis is needed" (specify WHAT analysis, by WHOM, by WHEN)

- "Stakeholder alignment is key" (name the SPECIFIC stakeholder and the SPECIFIC misalignment)

- "There are significant risks" (name THE risk, the probability, and the magnitude)

- "Market conditions may change" (specify WHICH condition, in WHAT direction, by WHEN)

- "Consider the competitive landscape" (name the SPECIFIC competitor and their SPECIFIC likely response)

- "Ensure adequate resources" (specify WHAT resource, HOW MUCH, from WHERE)

- "This requires careful planning" (specify WHAT plan, with WHAT milestones)

- Any sentence that could apply to literally any business decision is banned.

SPECIFICITY TEST: Before finalising each field, ask yourself: "Could this sentence appear in an audit of a completely different decision?" If yes, it's too generic. Rewrite it with details that could ONLY apply to this specific decision.

FIELD SPECIFICATIONS:

verdict: Exactly one of: "PROCEED", "CONDITIONAL PROCEED", "DO NOT PROCEED", "DEFER — INFORMATION NEEDED"

confidence_score: Integer 0-100. Calibrated by Pass 3 adversarial strength. Most well-considered decisions land 45-68. Scores above 75 are rare and require weak adversarial counter-arguments. Scores below 30 mean the decision is premature.

confidence_rationale: The single most important factor limiting confidence, written as: "Scored [n] because [specific factor], which [specific consequence if unaddressed]." Max 220 chars.

biggest_risk: From Pass 2, the risk that the three experts agreed was most dangerous. Format: "[What happens] → [cascade effect] → [ultimate consequence with estimated magnitude]." Max 220 chars.

hidden_assumption: From Pass 1 decomposition. The belief being treated as fact. Format: "You assume [X]. If [Y] is true instead, [Z]." Max 220 chars.

better_question: From Pass 2 expert disagreement. The reframe that shifts the decision to a more powerful frame. Must start with What, How, Who, or When. Must feel like a revelation, not a platitude. Max 220 chars.

devils_advocate: From Pass 3, the strongest adversarial argument condensed into 2-3 sentences. This should make the CEO genuinely uncomfortable. Max 320 chars.

thirty_day_test: A specific experiment with: what to measure, what threshold = go/no-go, who owns it, and the exact timeframe. Max 320 chars.

stakeholder_gap: From Pass 2 Expert C. The person or group whose reaction will determine success but hasn't been considered. Name the role, explain why they matter. Max 220 chars.

assumptions_to_validate: Array of exactly 3 strings. Each follows: "Test whether [specific assumption] by [specific method] within [specific timeframe]. Go/no-go threshold: [specific metric]." Max 220 chars each.

risk_register: Array of exactly 3 strings. Each follows: "[NAMED RISK]: [High/Medium/Low probability] — [specific consequence with magnitude] — [specific mitigation with owner and deadline]." Max 220 chars each.

information_needed: Array of exactly 3 strings. Each follows: "Obtain [specific data] from [specific source] by [specific date]. Without this, [specific consequence for the decision]." Max 220 chars each.

</output_rules>

<example_quality_standard>

For the decision "Should we acquire a £2M AI startup?", here is what BAD vs GOOD output looks like:

BAD biggest_risk: "The acquisition might not deliver expected value."

GOOD biggest_risk: "Target's 3 key engineers leave post-acquisition → 18-month product roadmap collapses → £2M becomes sunk cost plus £400K recruitment to rebuild."

BAD better_question: "Have you considered all the options?"

GOOD better_question: "What would it cost to hire the startup's 3 senior engineers directly, and would that achieve 80% of the capability at 30% of the price?"

BAD assumptions_to_validate: "Validate that the market is ready."

GOOD assumptions_to_validate: "Test whether target's top 3 clients will renew post-acquisition by interviewing each CEO within 14 days. Go/no-go: 2 of 3 must confirm in writing."

Your output must match the GOOD standard, not the BAD. Every field must contain detail that could ONLY apply to this specific decision.

</example_quality_standard>`;

function buildUserMessage(decision: string, lens?: string, scale?: string): string {
  const focusLens = lens || "auto-detect from decision context";
  const decisionScale = scale || "auto-detect from decision context";
  return `<decision_audit_request>

<decision>${decision}</decision>

<focus_lens>${focusLens}</focus_lens>

<decision_scale>${decisionScale}</decision_scale>

<audit_instruction>

Complete all four reasoning passes (Decomposition → Multi-Expert Tree-of-Thought → Adversarial Challenge → Synthesis) before producing your JSON output. Think step by step through each pass. The CEO paying for this audit will compare it against a real £50,000 McKinsey deliverable. If your output reads like generic AI, you have failed. Every sentence must contain a detail that could only apply to THIS specific decision.

</audit_instruction>

</decision_audit_request>`;
}

// Rate limiting
const rateLimit = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 3600000;
const RATE_LIMIT_MAX = 15;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requests = rateLimit.get(ip) || [];
  const recent = requests.filter(t => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= RATE_LIMIT_MAX) return false;
  recent.push(now);
  rateLimit.set(ip, recent);
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { decision, lens, scale } = body;

    if (!decision || typeof decision !== "string" || decision.trim().length < 20) {
      return new Response(JSON.stringify({ error: "Decision must be at least 20 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userMessage = buildUserMessage(decision.trim(), lens, scale);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "audit_decision",
              description: "Return a structured decision audit",
              parameters: {
                type: "object",
                properties: {
                  confidence_score: { type: "number" },
                  confidence_rationale: { type: "string" },
                  verdict: { type: "string", enum: ["PROCEED", "CONDITIONAL PROCEED", "DO NOT PROCEED", "DEFER — INFORMATION NEEDED"] },
                  biggest_risk: { type: "string" },
                  hidden_assumption: { type: "string" },
                  better_question: { type: "string" },
                  devils_advocate: { type: "string" },
                  stakeholder_gap: { type: "string" },
                  thirty_day_test: { type: "string" },
                  assumptions_to_validate: { type: "array", items: { type: "string" } },
                  risk_register: { type: "array", items: { type: "string" } },
                  information_needed: { type: "array", items: { type: "string" } },
                },
                required: [
                  "confidence_score", "confidence_rationale", "verdict",
                  "biggest_risk", "hidden_assumption", "better_question",
                  "devils_advocate", "stakeholder_gap", "thirty_day_test",
                  "assumptions_to_validate", "risk_register", "information_needed",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "audit_decision" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(aiResponse));
      return new Response(JSON.stringify({ error: "Invalid AI response format" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = JSON.parse(toolCall.function.arguments);

    const truncate = (s: string | undefined, max: number) => typeof s === "string" ? s.slice(0, max) : "";
    const truncateArr = (arr: any, max: number, itemMax: number) => Array.isArray(arr) ? arr.map((s: any) => typeof s === "string" ? s.slice(0, itemMax) : "").slice(0, max) : [];

    const validVerdicts = ["PROCEED", "CONDITIONAL PROCEED", "DO NOT PROCEED", "DEFER — INFORMATION NEEDED"];

    const result = {
      confidence_score: Math.max(0, Math.min(100, Math.round(Number(raw.confidence_score) || 50))),
      confidence_rationale: truncate(raw.confidence_rationale, 220),
      verdict: validVerdicts.includes(raw.verdict) ? raw.verdict : "CONDITIONAL PROCEED",
      biggest_risk: truncate(raw.biggest_risk, 220),
      hidden_assumption: truncate(raw.hidden_assumption, 220),
      better_question: truncate(raw.better_question, 220),
      devils_advocate: truncate(raw.devils_advocate, 320),
      stakeholder_gap: truncate(raw.stakeholder_gap, 220),
      thirty_day_test: truncate(raw.thirty_day_test, 320),
      assumptions_to_validate: truncateArr(raw.assumptions_to_validate, 3, 220),
      risk_register: truncateArr(raw.risk_register, 3, 220),
      information_needed: truncateArr(raw.information_needed, 3, 220),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Audit error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
