import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface DiagnosticInput {
  decision: string;
  focus: 'risk' | 'speed' | 'board' | 'confidence';
  scale: 'tactical' | 'operational' | 'strategic' | 'existential';
  budget?: string;
  timeline?: string;
  constraint?: string;
}

function buildSystemPrompt(input: DiagnosticInput): string {
  const focusInstructions: Record<string, string> = {
    risk: `PRIMARY LENS — RISK IDENTIFICATION: Prioritise failure modes, downside scenarios, and second-order consequences above all else. Weight biggest_risk and devils_argument as your most critical outputs. Do not soften.`,
    speed: `PRIMARY LENS — VALIDATED LEARNING: The user needs to move fast. The thirty_day_test is your most important output — make it specific, measurable, and immediately actionable.`,
    board: `PRIMARY LENS — STRUCTURED CASE: Frame as the strongest possible case FOR vs AGAINST. Surface the question the board will inevitably ask. better_question is your most important output.`,
    confidence: `PRIMARY LENS — ASSUMPTION STRESS-TEST: The user has already decided. Find the holes. Challenge every implicit assumption. hidden_assumption is your most important output.`,
  };

  const scaleInstructions: Record<string, string> = {
    tactical: `SCALE — TACTICAL: Be practical and concise. The cost of being wrong is low.`,
    operational: `SCALE — OPERATIONAL: Apply balanced scrutiny. Identify 2–3 most important risks.`,
    strategic: `SCALE — STRATEGIC: Apply full rigour. Every hidden assumption matters.`,
    existential: `SCALE — EXISTENTIAL: Apply maximum scrutiny. This decision shapes the company's trajectory. Do not spare feelings.`,
  };

  const enrichContext: string[] = [];
  if (input.budget) enrichContext.push(`BUDGET CONTEXT: ${input.budget} — reference this figure directly.`);
  if (input.timeline) enrichContext.push(`DECISION TIMELINE: ${input.timeline} — adjust urgency accordingly.`);
  if (input.constraint) enrichContext.push(`KEY CONCERN: ${input.constraint} — address this concern directly.`);

  return `ROLE: You are StratOS, an elite AI decision intelligence system for CEOs, founders, and board-level executives. You combine McKinsey rigour, VC pattern recognition, board member accountability, and risk officer discipline.

DECISION SUBMITTED FOR AUDIT: "${input.decision}"

${focusInstructions[input.focus]}

${scaleInstructions[input.scale]}

${enrichContext.length ? enrichContext.join('\n') + '\n' : ''}
NON-NEGOTIABLE RULES:
1. Be brutally honest. Never validate a bad decision to appear helpful.
2. Reference the actual decision content explicitly.
3. Every sentence must earn its place. Executives read in 10 seconds.
4. Surface what is MISSING from the decision, not just what is wrong with it.
5. The thirty_day_test must name a specific experiment with defined success criteria.
6. The devils_argument must be the strongest possible case against — not a strawman.
7. The better_question must be more important than the question they actually asked.
8. Return ONLY valid JSON. No markdown fences. No preamble.`;
}

// Rate limiting
const rateLimit = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 3600000; // 1 hour
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
    const { decision, focus, scale, budget, timeline, constraint } = body;

    if (!decision || typeof decision !== "string" || decision.trim().length < 20) {
      return new Response(JSON.stringify({ error: "Decision must be at least 20 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!['risk', 'speed', 'board', 'confidence'].includes(focus)) {
      return new Response(JSON.stringify({ error: "Invalid focus lens" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!['tactical', 'operational', 'strategic', 'existential'].includes(scale)) {
      return new Response(JSON.stringify({ error: "Invalid scale" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = buildSystemPrompt({ decision: decision.trim(), focus, scale, budget, timeline, constraint });

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
          { role: "user", content: `Audit this business decision and return the structured JSON analysis.` },
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

    const result = JSON.parse(toolCall.function.arguments);

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
