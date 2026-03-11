export const STRIPE_TIERS = {
  free: {
    name: "Free",
    price: 0,
    audits: 3,
    label: "3 audits total",
    features: ["Full scorecard", "Copy brief"],
  },
  pro: {
    name: "Pro",
    price: 19,
    audits: 25,
    label: "25 audits/month",
    price_id: "price_1T9kHsLWN2xlvHjuTn6S3r2b",
    product_id: "prod_U80I1oTNhGsKS7",
    features: ["Full scorecard", "Decision Journal", "Dashboard", "PDF export", "Share links"],
  },
  executive: {
    name: "Executive",
    price: 49,
    audits: 120,
    label: "120 audits/month",
    price_id: "price_1T9kLHLWN2xlvHjuh3bn8CqX",
    product_id: "prod_U80LMla9yMEoUz",
    features: [
      "Everything in Pro",
      "Priority processing",
      "Team sharing (coming soon)",
    ],
  },
} as const;

export type PlanType = keyof typeof STRIPE_TIERS;

export function getPlanFromProductId(productId: string | null): PlanType {
  if (productId === STRIPE_TIERS.pro.product_id) return "pro";
  if (productId === STRIPE_TIERS.executive.product_id) return "executive";
  return "free";
}
