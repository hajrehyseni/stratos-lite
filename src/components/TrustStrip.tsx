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
      className="w-full"
      style={{ borderTop: "1px solid hsla(0, 0%, 100%, 0.08)", borderBottom: "1px solid hsla(0, 0%, 100%, 0.08)" }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4 sm:px-6 py-12 mx-auto" style={{ maxWidth: 900 }}>
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col items-center text-center">
            <span className="text-3xl font-extrabold" style={{ color: "hsl(var(--text-primary))" }}>
              {m.value}
            </span>
            <span className="mt-1.5 text-sm" style={{ color: "hsl(var(--text-secondary))" }}>
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
