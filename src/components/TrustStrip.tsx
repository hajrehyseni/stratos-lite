/* <!-- PLACEHOLDER METRICS — update with real analytics --> */

const metrics = [
  { value: "12,400+", label: "Decisions audited" },
  { value: "<30s", label: "Average audit time" },
  { value: "4.8★", label: "User rating" },
  { value: "6", label: "Frameworks applied" },
];

export function TrustStrip() {
  return (
    <div
      className="w-full overflow-x-auto scrollbar-hide"
      style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="flex items-center justify-between gap-6 px-4 py-8 mx-auto" style={{ maxWidth: 900, minWidth: 480 }}>
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col items-center text-center flex-1">
            <span className="text-2xl font-bold" style={{ color: "hsl(var(--primary))" }}>
              {m.value}
            </span>
            <span
              className="mt-1 text-xs"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
