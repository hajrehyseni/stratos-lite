import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildSystemPrompt(decision: string): string {
  return `You are a senior decision strategist with 25 years of experience advising boards and C-suite executives on high-stakes strategic decisions. You have deep expertise in risk analysis, game theory, organisational dynamics, and corporate strategy.

You are conducting a formal Decision Audit for an executive. Your output must read like a £50,000 strategy deliverable — specific, quantified where possible, contrarian where warranted, and ruthlessly honest. No filler. No generic advice. Every sentence must earn its place.

CONTEXT:
- Decision: "${decision}"
- Primary lens: Infer from the decision text (risk, speed, alignment, or confidence)
- Decision scale: Infer from the decision text (team, department, company, or existential)

ANALYTICAL FRAMEWORK:
1. Apply second-order thinking — what happens AFTER the obvious outcome?
2. Identify the stakeholder who will be most damaged by this decision and why
3. Find the assumption that everyone in the room has accepted without evidence
4. Calculate what happens if this decision is delayed 90 days — is the cost of delay real or manufactured urgency?
5. Name the specific scenario where this decision catastrophically fails
6. Identify what information would change this from a 50/50 to an 80/20 decision

CRITICAL RULES:
- Never say "it depends" — take a position
- Never use the phrases "various factors", "multiple considerations", "stakeholder buy-in" or any other consulting filler
- Every risk must name a SPECIFIC scenario, not a category
- The "better question" must genuinely reframe the problem — not just rephrase the original question
- The devil's advocate must be so compelling it makes the executive uncomfortable
- Confidence score: be honest. Most real decisions are 40-70. Only use 80+ if the evidence genuinely supports it. Never use exactly 50 — that's a cop-out
- If the decision description is vague, say so in the confidence_rationale and give a lower score
- Return ONLY valid JSON. No markdown fences. No preamble. No explanation. Just JSON.`;
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
    const { decision } = body;

    if (!decision || typeof decision !== "string" || decision.trim().length < 20) {
      return new Response(JSON.stringify({ error: "Decision must be at least 20 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = buildSystemPrompt(decision.trim());

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
          { role: "system", content: systemPrompt },
          { role: "user", content: "Audit this business decision and return the structured JSON analysis." },
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
    const truncateArr = (arr: any, max: number) => Array.isArray(arr) ? arr.map((s: any) => typeof s === "string" ? s.slice(0, max) : "").slice(0, 5) : [];

    const validVerdicts = ["PROCEED", "CONDITIONAL PROCEED", "DO NOT PROCEED", "DEFER — INFORMATION NEEDED"];

    const result = {
      confidence_score: Math.round(Number(raw.confidence_score) || 50),
      confidence_rationale: truncate(raw.confidence_rationale, 200),
      verdict: validVerdicts.includes(raw.verdict) ? raw.verdict : "CONDITIONAL PROCEED",
      biggest_risk: truncate(raw.biggest_risk, 300),
      hidden_assumption: truncate(raw.hidden_assumption, 300),
      better_question: truncate(raw.better_question, 250),
      devils_advocate: truncate(raw.devils_advocate, 350),
      stakeholder_gap: truncate(raw.stakeholder_gap, 300),
      thirty_day_test: truncate(raw.thirty_day_test, 250),
      assumptions_to_validate: truncateArr(raw.assumptions_to_validate, 200),
      risk_register: truncateArr(raw.risk_register, 200),
      information_needed: truncateArr(raw.information_needed, 200),
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
