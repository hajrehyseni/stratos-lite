import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the Chief Decision Scientist at a £500M strategy advisory firm. You have 22 years of board-level experience across M&A, market entry, restructuring, and capital allocation. You combine the rigour of McKinsey's structured problem-solving with Bain's decision accountability frameworks and academic decision science.

You are direct, specific, and ruthlessly honest. You never use consulting clichés. Every claim contains a specific name, number, date, or £/$ figure. You think in structured frameworks, not freeform prose.

ABSOLUTE RULES:
- Every risk must include a specific £/$ figure for potential impact
- Every stakeholder must be identified by role title, not "key stakeholders"
- The pre-mortem must read as a vivid narrative, not a bullet list
- Second-order effects must chain at least 2 levels deep (if X then Y, if Y then Z)
- MECE branches must be genuinely mutually exclusive — no overlap
- The confidence score must be calibrated: 20-40 for genuinely uncertain decisions, 40-60 for conditional decisions, 60-80 only when evidence strongly supports one direction. Never above 80.
- NEVER use these phrases: "at the end of the day", "moving forward", "key stakeholders", "synergies", "leverage", "align", "best practices", "deep dive", "circle back", "touch base", "low-hanging fruit", "paradigm shift"

You will be told which analytical frameworks to apply. Apply ONLY the requested frameworks. Each framework has a specific output format described below.

FRAMEWORK DEFINITIONS:

MECE_TREE: Decompose the decision into 4 mutually exclusive, collectively exhaustive branches. Each branch gets a title (max 6 words) and 2-3 specific findings with £/$ figures. The branches together must cover 100% of the decision space with zero overlap.

PRE_MORTEM: Write a vivid first-person narrative set 12 months in the future where this decision has failed catastrophically. Include specific dates, £ figures, names of roles involved, and the chain of events that led to failure. 3-5 sentences, emotionally compelling.

TIME_HORIZON: Three sentences — how this decision feels in 10 minutes (emotional/immediate), 10 months (operational/tactical), 10 years (strategic/legacy). Each must be specific to this decision, not generic.

RAPID_ACCOUNTABILITY: Map the decision using Bain's RAPID framework — who should Recommend (1 role), who must Agree (1-2 roles), who Performs (1 role), who provides Input (2-3 roles), who Decides (1 role). Use specific role titles relevant to this decision and company context.

SECOND_ORDER: Identify the first-order effect of the decision, then chain 2 second-order effects and 1 third-order effect. Format: "If [decision] → then [first-order] → which causes [second-order] → which triggers [third-order]". Each link must be specific with names or £ figures.

CYNEFIN: Classify the decision domain as Clear, Complicated, Complex, or Chaotic. Provide the classification, a one-sentence justification, and the recommended approach for that domain (Clear=apply best practice, Complicated=analyse then act, Complex=probe-sense-respond with safe-to-fail experiments, Chaotic=act immediately then sense).

OPPORTUNITY_COST: Explicitly name the top 2 things you CANNOT do if you proceed with this decision. Include £ figures or strategic value of what's being sacrificed.

STAKEHOLDER_MAP: Identify 4-6 stakeholders, their position (Support/Oppose/Neutral), their influence level (High/Medium/Low), and the single action needed to manage each one.`;

function buildUserMessage(
  decision: string,
  stakes: string | undefined,
  decision_type: string,
  blast_radius: string,
  primary_constraint: string,
  success_vision: string | undefined,
  frameworks: string[],
): string {
  let xml = `<decision_context>
  <decision_text>${decision}</decision_text>`;
  if (stakes && stakes.trim()) xml += `\n  <stakes>${stakes.trim()}</stakes>`;
  xml += `\n  <decision_type>${decision_type}</decision_type>`;
  xml += `\n  <blast_radius>${blast_radius}</blast_radius>`;
  xml += `\n  <primary_constraint>${primary_constraint}</primary_constraint>`;
  if (success_vision && success_vision.trim()) xml += `\n  <success_vision>${success_vision.trim()}</success_vision>`;
  xml += `\n</decision_context>

<frameworks_to_apply>
${frameworks.join(", ")}
</frameworks_to_apply>

Perform the decision audit using ONLY the frameworks listed above. Return the JSON object matching the schema exactly. No preamble, no explanation — only the JSON.`;
  return xml;
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
    const { decision, stakes, decision_type, blast_radius, primary_constraint, success_vision, frameworks } = body;

    if (!decision || typeof decision !== "string" || decision.trim().length < 20) {
      return new Response(JSON.stringify({ error: "Decision must be at least 20 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fw: string[] = Array.isArray(frameworks) && frameworks.length > 0
      ? frameworks
      : ["mece_tree", "pre_mortem", "time_horizon"];

    const userMessage = buildUserMessage(
      decision.trim(),
      stakes,
      decision_type || "risk",
      blast_radius || "company",
      primary_constraint || "data",
      success_vision,
      fw,
    );

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Build tool parameters based on which frameworks are requested
    const hasCynefin = fw.some(f => f.startsWith("cynefin"));
    const hasRapid = fw.includes("rapid_accountability");
    const hasSecondOrder = fw.includes("second_order");
    const hasOpportunityCost = fw.includes("opportunity_cost");
    const hasStakeholderMap = fw.includes("stakeholder_map");

    const properties: Record<string, any> = {
      confidence_score: { type: "number" },
      verdict: { type: "string", enum: ["PROCEED", "CONDITIONAL PROCEED", "DO NOT PROCEED", "DEFER — INFORMATION NEEDED"] },
      verdict_rationale: { type: "string" },
      reframe_question: { type: "string" },
      biggest_risk: { type: "string" },
      hidden_assumption: { type: "string" },
      stakeholder_blind_spot: { type: "string" },
      devils_advocate: { type: "string" },
      validation_test_30_day: { type: "string" },
      assumptions_to_validate: { type: "array", items: { type: "string" } },
      risk_register: { type: "array", items: { type: "string" } },
      information_needed: { type: "array", items: { type: "string" } },
      mece_tree: {
        type: "object",
        properties: {
          branches: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                findings: { type: "array", items: { type: "string" } },
              },
              required: ["title", "findings"],
            },
          },
        },
        required: ["branches"],
      },
      pre_mortem_narrative: { type: "string" },
      time_horizon: {
        type: "object",
        properties: {
          ten_minutes: { type: "string" },
          ten_months: { type: "string" },
          ten_years: { type: "string" },
        },
        required: ["ten_minutes", "ten_months", "ten_years"],
      },
    };

    const required = [
      "confidence_score", "verdict", "verdict_rationale", "reframe_question",
      "biggest_risk", "hidden_assumption", "stakeholder_blind_spot",
      "devils_advocate", "validation_test_30_day",
      "assumptions_to_validate", "risk_register", "information_needed",
      "mece_tree", "pre_mortem_narrative", "time_horizon",
    ];

    if (hasCynefin) {
      properties.decision_domain = { type: "string", enum: ["CLEAR", "COMPLICATED", "COMPLEX", "CHAOTIC"] };
      properties.decision_domain_approach = { type: "string" };
      required.push("decision_domain", "decision_domain_approach");
    }
    if (hasRapid) {
      properties.rapid = {
        type: "object",
        properties: {
          recommend: { type: "string" },
          agree: { type: "string" },
          perform: { type: "string" },
          input: { type: "string" },
          decide: { type: "string" },
        },
        required: ["recommend", "agree", "perform", "input", "decide"],
      };
      required.push("rapid");
    }
    if (hasSecondOrder) {
      properties.second_order_chain = { type: "string" };
      required.push("second_order_chain");
    }
    if (hasOpportunityCost) {
      properties.opportunity_cost = { type: "array", items: { type: "string" } };
      required.push("opportunity_cost");
    }
    if (hasStakeholderMap) {
      properties.stakeholder_map = {
        type: "array",
        items: {
          type: "object",
          properties: {
            role: { type: "string" },
            position: { type: "string", enum: ["Support", "Oppose", "Neutral"] },
            influence: { type: "string", enum: ["High", "Medium", "Low"] },
            action: { type: "string" },
          },
          required: ["role", "position", "influence", "action"],
        },
      };
      required.push("stakeholder_map");
    }

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
              description: "Return a structured framework-routed decision audit",
              parameters: {
                type: "object",
                properties,
                required,
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
    const truncateArr = (arr: any, max: number, itemMax: number) =>
      Array.isArray(arr) ? arr.map((s: any) => typeof s === "string" ? s.slice(0, itemMax) : "").slice(0, max) : [];

    const validVerdicts = ["PROCEED", "CONDITIONAL PROCEED", "DO NOT PROCEED", "DEFER — INFORMATION NEEDED"];

    const result: Record<string, any> = {
      confidence_score: Math.max(0, Math.min(100, Math.round(Number(raw.confidence_score) || 50))),
      verdict: validVerdicts.includes(raw.verdict) ? raw.verdict : "CONDITIONAL PROCEED",
      verdict_rationale: truncate(raw.verdict_rationale, 200),
      reframe_question: truncate(raw.reframe_question, 200),
      biggest_risk: truncate(raw.biggest_risk, 200),
      hidden_assumption: truncate(raw.hidden_assumption, 200),
      stakeholder_blind_spot: truncate(raw.stakeholder_blind_spot, 200),
      devils_advocate: truncate(raw.devils_advocate, 250),
      validation_test_30_day: truncate(raw.validation_test_30_day, 200),
      assumptions_to_validate: truncateArr(raw.assumptions_to_validate, 3, 220),
      risk_register: truncateArr(raw.risk_register, 3, 220),
      information_needed: truncateArr(raw.information_needed, 3, 220),
    };

    // MECE tree
    if (raw.mece_tree?.branches && Array.isArray(raw.mece_tree.branches)) {
      result.mece_tree = {
        branches: raw.mece_tree.branches.slice(0, 6).map((b: any) => ({
          title: truncate(b?.title, 60),
          findings: Array.isArray(b?.findings) ? b.findings.map((f: any) => truncate(f, 200)).slice(0, 3) : [],
        })),
      };
    }

    // Pre-mortem
    if (raw.pre_mortem_narrative) {
      result.pre_mortem_narrative = truncate(raw.pre_mortem_narrative, 500);
    }

    // Time horizon
    if (raw.time_horizon) {
      result.time_horizon = {
        ten_minutes: truncate(raw.time_horizon.ten_minutes, 120),
        ten_months: truncate(raw.time_horizon.ten_months, 120),
        ten_years: truncate(raw.time_horizon.ten_years, 120),
      };
    }

    // Cynefin
    if (raw.decision_domain) {
      const validDomains = ["CLEAR", "COMPLICATED", "COMPLEX", "CHAOTIC"];
      result.decision_domain = validDomains.includes(raw.decision_domain) ? raw.decision_domain : null;
      result.decision_domain_approach = truncate(raw.decision_domain_approach, 150);
    }

    // RAPID
    if (raw.rapid) {
      result.rapid = {
        recommend: truncate(raw.rapid.recommend, 100),
        agree: truncate(raw.rapid.agree, 100),
        perform: truncate(raw.rapid.perform, 100),
        input: truncate(raw.rapid.input, 150),
        decide: truncate(raw.rapid.decide, 100),
      };
    }

    // Second order
    if (raw.second_order_chain) {
      result.second_order_chain = truncate(raw.second_order_chain, 300);
    }

    // Opportunity cost
    if (Array.isArray(raw.opportunity_cost)) {
      result.opportunity_cost = raw.opportunity_cost.slice(0, 2).map((s: any) => truncate(s, 200));
    }

    // Stakeholder map
    if (Array.isArray(raw.stakeholder_map)) {
      const validPositions = ["Support", "Oppose", "Neutral"];
      const validInfluence = ["High", "Medium", "Low"];
      result.stakeholder_map = raw.stakeholder_map.slice(0, 6).map((s: any) => ({
        role: truncate(s?.role, 80),
        position: validPositions.includes(s?.position) ? s.position : "Neutral",
        influence: validInfluence.includes(s?.influence) ? s.influence : "Medium",
        action: truncate(s?.action, 150),
      }));
    }

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
