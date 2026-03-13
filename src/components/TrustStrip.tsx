const metrics = [
  { value: "12,400+", label: "Decisions audited" },
  { value: "<30s", label: "Average audit time" },
  { value: "4.8★", label: "User rating" },
];

export function TrustStrip() {
  return (
    <div
      className="w-full"
      style={{ borderTop: "1px solid hsla(0, 0%, 100%, 0.08)", borderBottom: "1px solid hsla(0, 0%, 100%, 0.08)" }}
    >
      <div className="grid grid-cols-3 gap-6 px-4 sm:px-6 py-12 mx-auto" style={{ maxWidth: 720 }}>
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col items-center text-center">
            <span className="text-2xl sm:text-3xl font-extrabold" style={{ color: "hsl(var(--text-primary))" }}>
              {m.value}
            </span>
            <span className="mt-1.5 text-xs sm:text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
