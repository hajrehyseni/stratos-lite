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
      style={{ borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center justify-between gap-6 px-4 py-10 mx-auto" style={{ maxWidth: 900, minWidth: 480 }}>
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col items-center text-center flex-1">
            <span className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>
              {m.value}
            </span>
            <span
              className="mt-1 text-sm"
              style={{ color: "#6B7280" }}
            >
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
