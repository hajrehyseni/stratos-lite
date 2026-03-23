import { Layers, Clock, Award } from "lucide-react";

const metrics = [
  { icon: Layers, value: "6 frameworks", label: "McKinsey-grade analysis" },
  { icon: Clock, value: "30 seconds", label: "From question to verdict" },
  { icon: Award, value: "10-step audit", label: "SSM + SODA methodology" },
];

export function TrustStrip() {
  return (
    <div className="w-full" style={{ borderTop: "1px solid hsl(var(--border))", borderBottom: "1px solid hsl(var(--border))" }}>
      <div className="grid grid-cols-3 gap-6 px-4 sm:px-6 py-12 mx-auto" style={{ maxWidth: 720 }}>
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="flex flex-col items-center text-center gap-2">
              <Icon className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
              <span className="text-lg sm:text-xl font-bold" style={{ color: "hsl(var(--text-primary))" }}>
                {m.value}
              </span>
              <span className="text-xs sm:text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>{m.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
