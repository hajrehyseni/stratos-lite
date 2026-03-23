import { Layers, Clock, Award } from "lucide-react";

const metrics = [
  { icon: Layers, value: "6 frameworks" },
  { icon: Clock, value: "30 seconds" },
  { icon: Award, value: "10-step audit" },
];

export function TrustStrip() {
  return (
    <div className="w-full" style={{ borderTop: "1px solid hsl(var(--border))", borderBottom: "1px solid hsl(var(--border))" }}>
      <div className="flex items-center justify-center gap-0 px-4 sm:px-6 py-10 mx-auto" style={{ maxWidth: 640 }}>
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={m.value} className="flex flex-col items-center text-center gap-2 flex-1" style={{ borderRight: i < metrics.length - 1 ? "1px solid hsl(var(--border))" : "none" }}>
              <Icon className="w-6 h-6" style={{ color: "hsl(var(--primary))" }} />
              <span className="text-xl sm:text-2xl font-bold" style={{ color: "hsl(var(--text-primary))" }}>
                {m.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
