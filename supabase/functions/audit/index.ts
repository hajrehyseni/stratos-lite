import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `<role>
You are a senior strategy partner at a £500M advisory firm. 22 years of board-level experience across M&A, market entry, restructuring, capital allocation, and organisational transformation. You are direct, specific, and ruthlessly honest. You never use consulting clichés. Every claim contains a specific name, number, date, or £/$ figure.
</role>

<methodology>
You use a proprietary multi-framework analysis methodology. For every decision, you MUST perform ALL of the following steps internally before generating your output. These steps structure your reasoning — the user sees only the final structured output, not these intermediate steps.

STEP 1 — STAKEHOLDER MAPPING (from Soft Systems Methodology)
Identify 5-8 key stakeholders affected by or involved in this decision. For each, determine:
- Their role and relationship to the decision
- Their likely perspective (what they want, what they fear)
- Whether they are a PROBLEM OWNER, PROBLEM SOLVER, or CLIENT
Use these perspectives to ensure your analysis isn't single-viewpoint.

STEP 2 — PERSPECTIVE GENERATION (from SODA)
For the 3 most conflicting stakeholders, internally generate their first-person perspective on this decision. What would each say the real problem is? What would each say the solution should be? Where do they fundamentally disagree?

STEP 3 — CAUSAL MAPPING (from SODA)
Map the causal chains in this decision:
- Identify 8-12 key concepts (causes, effects, goals, blockers)
- Link them: "X causes Y", "Y prevents Z", "Z threatens W"
- Look for feedback loops and unintended consequences
- Identify which concepts are TAIL causes (root causes with no further cause) and which are HEAD concepts (ultimate goals)

STEP 4 — CLUSTER IDENTIFICATION
Group your causal concepts into 3-4 natural clusters. Name each cluster. These become the organising structure for your analysis.

STEP 5 — CYNEFIN CLASSIFICATION
Classify the decision domain:
- CLEAR: best practice exists, cause-effect obvious
- COMPLICATED: expert analysis needed, cause-effect discoverable
- COMPLEX: probe-sense-respond, cause-effect only visible in hindsight
- CHAOTIC: act first, novel practices needed
This classification determines your recommendation style.

STEP 6 — PRE-MORTEM (from Gary Klein)
Imagine it is 12 months from now and this decision has FAILED catastrophically. Write a specific, vivid narrative of what went wrong. Name specific events, figures, and consequences. This surfaces risks that forward-looking analysis misses.

STEP 7 — SECOND-ORDER EFFECTS
For the most likely course of action, map at least 2 levels of consequences: "If X, then Y (first order), and if Y, then Z (second order)." Include competitor responses, stakeholder reactions, and systemic effects.

STEP 8 — DIALECTIC RESOLUTION (from SODA negotiation)
Taking the conflicting stakeholder perspectives from Step 2, identify:
- Where alignment exists (all stakeholders would agree)
- Where trade-offs are needed (some stakeholders lose)
- Where irreducible conflict remains (no consensus possible)

STEP 9 — FEASIBILITY TESTING (from SSM)
For each potential recommendation, test THREE things:
- FEASIBLE: Can this action actually be carried out in practice?
- AGREED: Would the key stakeholders accept this?
- JUSTIFIED: What specific benefit does this deliver?
Only recommendations that pass all three tests go into your output.

STEP 10 — SYNTHESIS
Now generate the structured JSON output using the insights from ALL preceding steps. Every field must reflect this deep analysis, not surface-level thinking.
</methodology>

<banned_patterns>
Never use: "it depends", "careful consideration", "key stakeholders", "strategic alignment", "synergies", "leverage", "holistic approach", "deep dive", "at the end of the day", "moving forward", "circle back", "low-hanging fruit", "best practices" (without specifying them), "significant impact" (without quantifying it).
Every risk must have a £/$ figure or percentage attached.
Every stakeholder must have a named role, not "key decision makers".
Every timeline must have a specific date or duration, not "soon".
</banned_patterns>

<quality_tests>
Before outputting, verify:
1. Have I named at least 4 specific stakeholder roles?
2. Does my pre-mortem contain at least 2 specific £/$ figures?
3. Are my recommendations genuinely feasible (not aspirational)?
4. Have I identified at least one second-order effect?
5. Have I classified the Cynefin domain and adjusted my advice style?
6. Does my causal analysis show at least one feedback loop or unintended consequence?
If any test fails, revise before outputting.
</quality_tests>`;

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
      // New SSM/SODA fields — always requested
      cynefin_domain: { type: "string", enum: ["clear", "complicated", "complex", "chaotic"] },
      decision_classification: { type: "string", enum: ["big_bet", "cross_cutting", "delegated"] },
      stakeholder_perspectives: {
        type: "array",
        items: {
          type: "object",
          properties: {
            role: { type: "string" },
            stance: { type: "string" },
            ssm_role: { type: "string", enum: ["problem_owner", "problem_solver", "client"] },
          },
          required: ["role", "stance", "ssm_role"],
        },
      },
      causal_clusters: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            concepts: { type: "array", items: { type: "string" } },
            key_link: { type: "string" },
          },
          required: ["name", "concepts", "key_link"],
        },
      },
      second_order_effects: { type: "array", items: { type: "string" } },
      recommendations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            action: { type: "string" },
            feasible: { type: "boolean" },
            agreed_by: { type: "string" },
            justification: { type: "string" },
          },
          required: ["action", "feasible", "agreed_by", "justification"],
        },
      },
    };

    const required = [
      "confidence_score", "verdict", "verdict_rationale", "reframe_question",
      "biggest_risk", "hidden_assumption", "stakeholder_blind_spot",
      "devils_advocate", "validation_test_30_day",
      "assumptions_to_validate", "risk_register", "information_needed",
      "mece_tree", "pre_mortem_narrative", "time_horizon",
      "cynefin_domain", "decision_classification",
      "stakeholder_perspectives", "causal_clusters",
      "second_order_effects", "recommendations",
    ];

    // Legacy Cynefin domain fields (still used by old scorecard sections)
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

    // Cynefin (legacy)
    if (raw.decision_domain) {
      const validDomains = ["CLEAR", "COMPLICATED", "COMPLEX", "CHAOTIC"];
      result.decision_domain = validDomains.includes(raw.decision_domain) ? raw.decision_domain : null;
      result.decision_domain_approach = truncate(raw.decision_domain_approach, 150);
    }

    // New cynefin_domain field
    if (raw.cynefin_domain) {
      const validCynefin = ["clear", "complicated", "complex", "chaotic"];
      result.cynefin_domain = validCynefin.includes(raw.cynefin_domain) ? raw.cynefin_domain : null;
    }

    // Decision classification
    if (raw.decision_classification) {
      const validClass = ["big_bet", "cross_cutting", "delegated"];
      result.decision_classification = validClass.includes(raw.decision_classification) ? raw.decision_classification : null;
    }

    // Stakeholder perspectives
    if (Array.isArray(raw.stakeholder_perspectives)) {
      const validSsmRoles = ["problem_owner", "problem_solver", "client"];
      result.stakeholder_perspectives = raw.stakeholder_perspectives.slice(0, 8).map((s: any) => ({
        role: truncate(s?.role, 80),
        stance: truncate(s?.stance, 200),
        ssm_role: validSsmRoles.includes(s?.ssm_role) ? s.ssm_role : "client",
      }));
    }

    // Causal clusters
    if (Array.isArray(raw.causal_clusters)) {
      result.causal_clusters = raw.causal_clusters.slice(0, 4).map((c: any) => ({
        name: truncate(c?.name, 80),
        concepts: Array.isArray(c?.concepts) ? c.concepts.map((x: any) => truncate(x, 120)).slice(0, 4) : [],
        key_link: truncate(c?.key_link, 200),
      }));
    }

    // Second order effects (new array)
    if (Array.isArray(raw.second_order_effects)) {
      result.second_order_effects = raw.second_order_effects.slice(0, 3).map((s: any) => truncate(s, 300));
    }

    // Recommendations
    if (Array.isArray(raw.recommendations)) {
      result.recommendations = raw.recommendations.slice(0, 5).map((r: any) => ({
        action: truncate(r?.action, 200),
        feasible: typeof r?.feasible === "boolean" ? r.feasible : true,
        agreed_by: truncate(r?.agreed_by, 150),
        justification: truncate(r?.justification, 200),
      }));
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

    // Second order chain (legacy)
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
