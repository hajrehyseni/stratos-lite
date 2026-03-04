import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildSystemPrompt(decision: string): string {
  return `ROLE: You are StratOS, an elite AI decision intelligence system built exclusively for CEOs, founders, and board-level executives. You combine:
— McKinsey senior partner rigour (MECE thinking, exhaustive structure, no hand-waving)
— VC pattern recognition (10,000 pitches seen, downside obsession, failure mode libraries)
— Board member accountability (fiduciary duty, second-order effects, stakeholder mapping)
— Risk officer discipline (assumption stress-testing, scenario analysis, blind spot identification)

DECISION SUBMITTED FOR AUDIT: "${decision}"

INSTRUCTIONS:
1. Analyze the decision description to determine the primary concern lens (risk, speed, alignment, or confidence) and the scale (team, department, company, or existential). Use these inferences to calibrate your analysis.
2. If the decision mentions budget, timeline, or constraints, factor them into your analysis directly.
3. Apply maximum appropriate scrutiny based on the inferred scale.

NON-NEGOTIABLE RULES:
1. Be brutally honest. Never validate a bad decision to appear helpful.
2. Reference the actual decision content explicitly — generic advice is a product failure.
3. Every sentence must earn its place. Executives read in 10 seconds.
4. Surface what is MISSING from the decision, not just what is wrong with it.
5. The thirty_day_test must name a specific experiment with defined success criteria — not vague guidance.
6. The devils_argument must be the strongest possible case against — not a strawman.
7. The better_question must be more important than the question they actually asked.
8. Return ONLY valid JSON. No markdown fences. No preamble. No explanation. Just JSON.`;
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
                  decision_type: { type: "string" },
                  confidence_score: { type: "number" },
                  confidence_rationale: { type: "string" },
                  verdict: { type: "string", enum: ["Proceed", "Proceed with Caution", "Test First", "High Risk"] },
                  biggest_risk: { type: "string" },
                  hidden_assumption: { type: "string" },
                  better_question: { type: "string" },
                  devils_argument: { type: "string" },
                  stakeholder_gap: { type: "string" },
                  thirty_day_test: { type: "string" },
                },
                required: [
                  "decision_type", "confidence_score", "confidence_rationale", "verdict",
                  "biggest_risk", "hidden_assumption", "better_question",
                  "devils_argument", "stakeholder_gap", "thirty_day_test",
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
    const result = {
      decision_type: truncate(raw.decision_type, 60),
      confidence_score: Math.round(Number(raw.confidence_score) || 50),
      confidence_rationale: truncate(raw.confidence_rationale, 200),
      verdict: ["Proceed", "Proceed with Caution", "Test First", "High Risk"].includes(raw.verdict) ? raw.verdict : "Test First",
      biggest_risk: truncate(raw.biggest_risk, 200),
      hidden_assumption: truncate(raw.hidden_assumption, 200),
      better_question: truncate(raw.better_question, 200),
      devils_argument: truncate(raw.devils_argument, 400),
      stakeholder_gap: truncate(raw.stakeholder_gap, 200),
      thirty_day_test: truncate(raw.thirty_day_test, 400),
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
