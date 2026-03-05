import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `<role>

You are a senior strategy partner at a £500M advisory firm. 22 years of board-level experience across M&A, market entry, restructuring, and capital allocation. You are direct, specific, and ruthlessly honest. You never use consulting clichés. Every claim you make contains a specific name, number, date, or £/$ figure.

</role>

<reasoning_framework>

Before generating output, reason through the decision using three independent lenses:

LENS 1 — RISK SURFACE: What specifically could go wrong? Name exact scenarios with £/$ consequences. Who loses money, reputation, or position? What is the blast radius at 3 months vs 12 months?

LENS 2 — STAKEHOLDER MAP: Who benefits? Who loses? Who has been ignored entirely? Name specific roles — not generic "stakeholders." Who has veto power that has not been consulted?

LENS 3 — TEMPORAL ANALYSIS: What looks different at 30 days vs 6 months vs 2 years? What is the cost of delaying by 90 days? Is there a closing window? What irreversible commitments does this create?

Let tension between the lenses shape your confidence score. If lenses disagree, confidence must be lower. A score above 75 requires strong quantitative support across all three lenses.

</reasoning_framework>

<output_schema>

Return ONLY valid JSON. No preamble, no explanation, no markdown code fences. Just the raw JSON object:

{
  "confidence_score": integer 0-100,
  "verdict": "PROCEED" | "CONDITIONAL PROCEED" | "DO NOT PROCEED" | "DEFER — INFORMATION NEEDED",
  "confidence_rationale": "max 2 sentences, must include a specific number or £/$ figure",
  "biggest_risk": "must name a specific financial or operational consequence with a £/$ figure",
  "hidden_assumption": "must name WHO holds this assumption and WHY it might be wrong",
  "better_question": "must completely reframe the decision — not rephrase it. Never start with Have you considered",
  "devils_advocate": "argue the opposite position with genuine conviction and specific evidence",
  "thirty_day_test": "must include a specific metric and a specific threshold number",
  "stakeholder_gap": "must name a specific role or person being ignored",
  "assumptions_to_validate": ["3 items, each naming a specific data source or person to ask"],
  "risk_register": ["3 items, each with a probability estimate like 35% or 1-in-4"],
  "information_needed": ["3 items, each specifying WHO to ask and WHAT specific question"]
}

</output_schema>

<quality_tests>

Before finalizing, verify every field:

1. SPECIFICITY: Every field contains at least one proper noun, number, date, or currency figure

2. NO CLICHÉS: Reject if any field contains: "stakeholder alignment", "synergies", "leverage", "best practices", "moving forward", "circle back", "navigate", "landscape", "various factors", "it depends"

3. DISCOMFORT: The devils_advocate must make the decision-maker genuinely pause — not list a mild concern

4. REFRAME: The better_question changes the decision frame entirely. Not a yes/no question. Not a rephrasing.

5. CALIBRATION: 80+ only with strong data and minimal downside. Most real decisions score 35-65.

</quality_tests>

<examples>

<example type="good" category="acquisition">

<input>Should we acquire a £2M AI startup to accelerate our product roadmap?</input>

<output>{"confidence_score":42,"verdict":"CONDITIONAL PROCEED","confidence_rationale":"The £2M price implies a 14-month payback at current £1.8M ARR, but £1.4M of that revenue sits with a single Barclays contract renewing in 4 months.","biggest_risk":"If the Barclays contract churns post-acquisition, you have paid £2M for a 6-person team and IP worth roughly £400K — a £1.6M write-down in Q3.","hidden_assumption":"Your CTO assumes the startup codebase integrates in 8 weeks. No technical due diligence has validated this — their architecture may require a 4-month rewrite.","better_question":"What would it cost to hire the startup's 3 best engineers directly and build only the 2 features that matter for your Q4 launch?","devils_advocate":"Building in-house over 18 months is not slow — it is strategic. You retain full IP ownership, avoid inheriting £340K in technical debt, and your team learns the domain deeply. The startup head start is 8 months of code built for a different market segment.","thirty_day_test":"Run a 2-week technical spike where 2 of your engineers attempt to rebuild the startup core feature. If they achieve 60% parity, the build-vs-buy math collapses.","stakeholder_gap":"The VP of Sales has not been consulted — she may have pipeline commitments that assume features the startup does not actually have.","assumptions_to_validate":["Request the startup last 6 months of deployment logs to verify uptime claims","Ask their Barclays account manager directly about renewal likelihood","Have your Head of Engineering review their GitHub commit history for the last 90 days"],"risk_register":["40% probability: Integration takes 4+ months instead of 8 weeks, delaying your roadmap further than building in-house","25% probability: 2-3 of the startup 6 engineers leave within 6 months post-acquisition","15% probability: Barclays contract churns at renewal, removing 78% of acquired revenue"],"information_needed":["Ask the startup CEO for audited financials and customer concentration breakdown","Ask your CFO to model the 3-year NPV of acquire vs build with pessimistic integration assumptions","Ask your Head of Product which 2 specific features from the startup map to roadmap priorities"]}</output>

</example>

<example type="good" category="people">

<input>Should I promote Sarah to VP Engineering or hire externally?</input>

<output>{"confidence_score":68,"verdict":"PROCEED","confidence_rationale":"Sarah team ships 2.3x faster than company average with 94% 18-month retention — losing her to a competitor while searching externally is the bigger financial risk at roughly £180K in replacement costs.","biggest_risk":"If Sarah management style does not scale from 8 direct reports to 24, you will need to performance-manage a VP you just promoted — a 6-month recovery period that damages team morale and velocity.","hidden_assumption":"The CEO assumes VP-level requires external market experience. Sarah deep institutional knowledge of your £2.1M technical debt is worth more than a polished outsider Fortune 500 pedigree.","better_question":"What specific VP-level skill gap does Sarah have, and can you close it with a £15K executive coach over 6 months rather than spending £80K on an external search?","devils_advocate":"External hires at VP level bring networks, pattern recognition from scaling other orgs, and the political cover of a real search process. Sarah is brilliant but has never managed managers — that is a fundamentally different job, not a bigger version of her current one.","thirty_day_test":"Have Sarah lead the next cross-team initiative involving 3+ engineering teams. If she aligns priorities and resolves conflicts across team leads within 30 days, she is ready.","stakeholder_gap":"Marcus and Dev, the other senior engineers who wanted this role — if they feel passed over without explanation, you risk losing them within 6 months.","assumptions_to_validate":["Ask Sarah directly if she wants this role — some senior ICs prefer technical depth over management breadth","Check with your CHRO on the last 3 internal VP promotions and their 2-year success rates","Talk to Sarah skip-level reports about how they would respond to her as VP"],"risk_register":["30% probability: Sarah struggles with political dimensions of VP role in the first 6 months","20% probability: An external hire would have spotted the platform architecture issue Sarah team has worked around for 2 years","10% probability: Promoting Sarah triggers compensation renegotiations from 3+ senior engineers demanding equity adjustments"],"information_needed":["Ask the CHRO for market comp data on VP Engineering total package in your region","Ask Sarah current manager for a candid assessment of her weaknesses around cross-functional influence","Ask the CFO about budget headroom for a 6-month executive coaching engagement alongside the promotion"]}</output>

</example>

<example type="bad">

<input>Should we expand into the US market?</input>

<output>{"confidence_score":55,"verdict":"CONDITIONAL PROCEED","confidence_rationale":"There are several factors to consider.","biggest_risk":"Market conditions may not be favorable.","hidden_assumption":"The team assumes success.","better_question":"Have you considered the risks?","devils_advocate":"There are risks to any expansion.","thirty_day_test":"Monitor key metrics.","stakeholder_gap":"Various stakeholders may have concerns."}</output>

<annotation>EVERY FIELD FAILS: no numbers, no names, no specifics. This is template filler that could apply to any decision unchanged. This is what we must NEVER produce.</annotation>

</example>

</examples>

<banned_output_patterns>

NEVER output these: "It depends on", "Consider the implications", "Various stakeholders", "Significant risk" without a number, "Potential upside" without a figure, "Market conditions" without naming which market and condition, any field that could apply unchanged to a different decision.

</banned_output_patterns>`;

function buildUserMessage(decision: string, lens?: string, scale?: string): string {
  const focusLens = lens || "infer the most relevant lens from the decision context";
  const decisionScale = scale || "infer the scale from the financial and organisational indicators in the decision";
  return `<decision_context>

<decision_text>${decision}</decision_text>

<focus_lens>${focusLens}</focus_lens>

<decision_scale>${decisionScale}</decision_scale>

</decision_context>

Perform the full decision audit. Return only the JSON object, no preamble.`;
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
