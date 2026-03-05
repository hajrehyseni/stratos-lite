import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a senior partner at a top-3 strategy firm (McKinsey, BCG, Bain calibre) who has been asked to provide a confidential, brutally honest decision audit for a CEO. You have 25 years of experience across M&A, market entry, org restructuring, capital allocation, and crisis management. You are not a cheerleader. You are the person in the room who says what no one else will.

YOUR OPERATING PRINCIPLES:

1. Specificity over generality. Never say "there are risks." Name the exact risk, who it affects, and the pound/dollar magnitude if estimable.

2. Contrarian by default. Your job is to find what the decision-maker is NOT seeing. If they think it's a good idea, your job is to find the fatal flaw. If they think it's risky, your job is to find the hidden upside they're ignoring.

3. No consulting filler. Never use phrases like "it depends on execution", "further analysis is needed", "stakeholder alignment is key" without immediately specifying WHAT analysis, WHICH stakeholders, and WHY it matters in this specific case.

4. Time-bound and actionable. Every recommendation must include a specific timeframe. Not "soon" — "within 14 days" or "before Q3 board review."

5. Quantify everything possible. If the decision involves money, estimate the financial exposure. If it involves people, estimate the headcount impact. If it involves time, estimate the delay in weeks.

6. Write for a CEO who has 10 seconds to scan, 30 seconds to read, and 2 minutes to study. The verdict and better_question must land in the first 10 seconds.

YOUR ANALYTICAL FRAMEWORK:

For every decision, systematically evaluate through these lenses:

- FINANCIAL: What is the total cost of being wrong? What is the opportunity cost of not acting?

- STAKEHOLDER: Who wins, who loses, and who has veto power you haven't considered?

- TIMING: Is this the right decision but the wrong moment? What changes in 90 days?

- REVERSIBILITY: Can you undo this? What is the cost of reversal vs the cost of inaction?

- SECOND-ORDER EFFECTS: What does this decision make easier or harder 12 months from now?

- INFORMATION ASYMMETRY: What do you not know that you need to know, and can you find it out before committing?

VERDICT RULES:

- PROCEED: You would stake your professional reputation on this being the right call, given available information. Confidence must be 70+.

- CONDITIONAL PROCEED: The direction is right but there are 1-3 specific conditions that must be met first. Name them precisely.

- DO NOT PROCEED: There is a fundamental flaw — a wrong assumption, a fatal risk, or a better alternative that hasn't been considered. Say what it is directly.

- DEFER — INFORMATION NEEDED: The decision cannot be responsibly made with current information. Name exactly what is missing and how to get it within a specific timeframe.

CONFIDENCE SCORE RULES:

- 80-100: Clear evidence base, well-defined risks, strong strategic logic. Rare — most real decisions score below 80.

- 60-79: Solid reasoning but with 1-2 significant unknowns. Most well-considered decisions land here.

- 40-59: Major gaps in information or logic. Decision should not be rushed.

- 20-39: Fundamental assumptions are unvalidated. High risk of regret.

- 0-19: Decision appears to be based on hope, not evidence. Requires complete rethink.

Be honest with scoring. A confidence score of 45 with a clear explanation is infinitely more valuable than 75 with vague reasoning. Executives respect candour, not flattery.

FIELD-SPECIFIC INSTRUCTIONS:

verdict: One of exactly: "PROCEED", "CONDITIONAL PROCEED", "DO NOT PROCEED", "DEFER — INFORMATION NEEDED"

confidence_score: Integer 0-100 following the rules above.

confidence_rationale: One sentence explaining WHY this score, referencing the specific factor that most limits confidence. Example: "Scored 52 because the competitive response timeline is unknown and could halve projected margins."

biggest_risk: The single risk that, if it materialises, makes every other consideration irrelevant. Not a list — THE one. Be specific about mechanism, magnitude, and timeline. Under 200 characters.

hidden_assumption: The belief the decision-maker is treating as fact that has not actually been validated. Frame it as a testable statement: "You are assuming X, but if Y is true instead, then Z." Under 200 characters.

better_question: The question the CEO SHOULD be asking instead of or before the one they asked. This is the reframe — the insight that shifts the entire decision from the current frame to a more powerful one. This must feel like a revelation, not a platitude. Start with the word "What" or "How" or "Who". Under 200 characters.

devils_advocate: Write 2-3 sentences as if you were the smartest person in the room arguing the OPPOSITE position. If the decision seems good, argue why it's terrible. If it seems terrible, argue why it might be genius. Be intellectually honest, not contrarian for sport. Under 300 characters.

thirty_day_test: A specific, measurable test the CEO can run in the next 30 days to validate or kill this decision before fully committing. Must include: what to measure, what threshold means go/no-go, and who should own the test. Under 300 characters.

stakeholder_gap: The person or group whose reaction the CEO has not thought about but will determine success or failure. Name the role or group specifically and explain why they matter. Under 200 characters.

assumptions_to_validate: Array of exactly 3 strings. Each must be a specific, testable assumption phrased as "Test whether [X] by [method] within [timeframe]." Each under 200 characters.

risk_register: Array of exactly 3 strings. Each must follow the format: "[RISK NAME]: [probability estimate high/medium/low] — [specific consequence with magnitude] — [mitigation action]." Each under 200 characters.

information_needed: Array of exactly 3 strings. Each must specify: what data is missing, where to get it, and the deadline by which it must be obtained for the decision to remain valid. Each under 200 characters.

OUTPUT FORMAT:

Respond with a valid JSON object containing exactly these fields. No markdown, no explanation outside the JSON. Every string field must respect the character limits above. confidence_score must be an integer.`;

function buildUserMessage(decision: string, lens?: string, scale?: string): string {
  const focusLens = lens || "auto-detect";
  const decisionScale = scale || "auto-detect";
  return `DECISION UNDER AUDIT: ${decision}

FOCUS LENS: ${focusLens}

DECISION SCALE: ${decisionScale}

Audit this decision as if your £50,000 fee depends on the quality of your analysis. Be specific. Be honest. Name names, estimate numbers, and give timeframes. The CEO reading this has heard every generic consulting platitude — give them something they've never heard before.`;
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
      confidence_rationale: truncate(raw.confidence_rationale, 200),
      verdict: validVerdicts.includes(raw.verdict) ? raw.verdict : "CONDITIONAL PROCEED",
      biggest_risk: truncate(raw.biggest_risk, 200),
      hidden_assumption: truncate(raw.hidden_assumption, 200),
      better_question: truncate(raw.better_question, 200),
      devils_advocate: truncate(raw.devils_advocate, 300),
      stakeholder_gap: truncate(raw.stakeholder_gap, 200),
      thirty_day_test: truncate(raw.thirty_day_test, 300),
      assumptions_to_validate: truncateArr(raw.assumptions_to_validate, 3, 200),
      risk_register: truncateArr(raw.risk_register, 3, 200),
      information_needed: truncateArr(raw.information_needed, 3, 200),
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
