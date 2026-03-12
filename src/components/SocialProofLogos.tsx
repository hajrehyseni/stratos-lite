/* <!-- Replace with real company logos when available --> */
const categories = [
  "Series B Startups",
  "FTSE 250",
  "Private Equity",
  "NHS Trusts",
  "Scale-ups",
  "Advisory Firms",
];

export function SocialProofLogos() {
  return (
    <div className="py-12 px-4">
      <p className="text-sm text-center mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
        Used by leaders at
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((c) => (
          <span
            key={c}
            className="rounded-full px-4 py-2 text-xs"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
