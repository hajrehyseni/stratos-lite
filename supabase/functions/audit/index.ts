import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are StratOS Lite, an executive decision auditor for CEOs and strategy leaders.

Your job is to audit the quality of a business decision and expose risks before commitment.

Act like a combination of:
• a board member
• a venture capitalist
• a strategy consultant
• a risk officer

Rules:
Return ONLY valid JSON.
Be brutally concise.
Never invent facts.
Executives must understand the answer in under 10 seconds.

All string fields must be extremely concise:
- biggest_risk, hidden_assumption, better_question, thirty_day_test: max 140 characters each
- devils_argument: max 240 characters
- confidence_reason: max 100 characters
- assumptions, risks_blind_spots, information_needed: arrays of 3-5 short strings each`;

// Simple in-memory rate limiting
const rateLimit = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10;

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
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { decision } = await req.json();
    if (!decision || typeof decision !== "string" || decision.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Decision is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (decision.length > 1000) {
      return new Response(JSON.stringify({ error: "Decision must be under 1000 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Audit this business decision:\n\n"${decision.trim()}"` },
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
                  decision_type: {
                    type: "string",
                    enum: ["Market Expansion", "Hiring", "Acquisition", "Fundraising", "Pivot", "Partnership", "Pricing", "Investment", "Operations", "Other"],
                  },
                  confidence_score: { type: "number" },
                  confidence_reason: { type: "string" },
                  verdict: { type: "string", enum: ["Proceed", "Proceed with Caution", "Test First", "High Risk"] },
                  biggest_risk: { type: "string" },
                  hidden_assumption: { type: "string" },
                  better_question: { type: "string" },
                  thirty_day_test: { type: "string" },
                  devils_argument: { type: "string" },
                  assumptions: { type: "array", items: { type: "string" } },
                  risks_blind_spots: { type: "array", items: { type: "string" } },
                  information_needed: { type: "array", items: { type: "string" } },
                },
                required: [
                  "decision_type", "confidence_score", "confidence_reason", "verdict",
                  "biggest_risk", "hidden_assumption", "better_question", "thirty_day_test",
                  "devils_argument", "assumptions", "risks_blind_spots", "information_needed",
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
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(aiResponse));
      return new Response(JSON.stringify({ error: "Invalid AI response format" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Audit error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
