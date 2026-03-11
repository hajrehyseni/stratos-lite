export type FrameworkId =
  | "mece_tree"
  | "pre_mortem"
  | "time_horizon"
  | "rapid_accountability"
  | "second_order"
  | "cynefin"
  | "opportunity_cost"
  | "stakeholder_map";

export interface FrameworkSelection {
  id: FrameworkId;
  cynefinDomain?: "clear" | "complicated" | "complex" | "chaotic";
}

interface DiagnosticInput {
  decision_type: string;
  blast_radius: string;
  primary_constraint: string;
}

export function selectFrameworks(input: DiagnosticInput): FrameworkSelection[] {
  const map = new Map<FrameworkId, FrameworkSelection>();

  const add = (id: FrameworkId, cynefinDomain?: string) => {
    if (map.has(id)) {
      // For cynefin, prefer more complex domain
      if (id === "cynefin" && cynefinDomain) {
        const existing = map.get(id)!;
        const rank: Record<string, number> = { clear: 0, complicated: 1, complex: 2, chaotic: 3 };
        if (rank[cynefinDomain] > rank[existing.cynefinDomain || "clear"]) {
          existing.cynefinDomain = cynefinDomain as any;
        }
      }
      return;
    }
    const sel: FrameworkSelection = { id };
    if (id === "cynefin" && cynefinDomain) sel.cynefinDomain = cynefinDomain as any;
    map.set(id, sel);
  };

  // ALL decisions get these 3
  add("mece_tree");
  add("pre_mortem");
  add("time_horizon");

  // Blast radius rules
  if (input.blast_radius === "bet-the-company" || input.blast_radius === "company") {
    add("rapid_accountability");
    add("second_order");
  }
  if (input.blast_radius === "bet-the-company") {
    add("cynefin", "complex");
  }

  // Decision type rules
  if (input.decision_type === "risk") {
    add("cynefin", "complex");
  }
  if (input.decision_type === "investment") {
    add("opportunity_cost");
  }
  if (input.decision_type === "people") {
    add("rapid_accountability");
    add("stakeholder_map");
  }
  if (input.decision_type === "growth") {
    add("opportunity_cost");
    add("second_order");
  }

  // Primary constraint rules
  if (input.primary_constraint === "politics") {
    add("rapid_accountability");
    add("stakeholder_map");
  }
  if (input.primary_constraint === "data") {
    add("cynefin", "complicated");
  }
  if (input.primary_constraint === "time") {
    add("cynefin", "chaotic");
  }

  return Array.from(map.values());
}

export function frameworkIds(selections: FrameworkSelection[]): string[] {
  return selections.map((s) => {
    if (s.id === "cynefin" && s.cynefinDomain) return `cynefin:${s.cynefinDomain}`;
    return s.id;
  });
}
