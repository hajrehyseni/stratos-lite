import { Layers, Clock, Award } from "lucide-react";

const metrics = [
  { icon: Layers, number: "6", label: "frameworks" },
  { icon: Clock, number: "30s", label: "to results" },
  { icon: Award, number: "10", label: "audit steps" },
];

export function TrustStrip() {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-center gap-8 sm:gap-16 px-4 sm:px-6 mx-auto" style={{ maxWidth: 640 }}>
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.number} className="flex flex-col items-center text-center gap-1">
              <Icon className="w-5 h-5 text-primary" />
              <span className="text-2xl sm:text-3xl font-bold text-foreground">
                {m.number}
              </span>
              <span className="text-xs text-muted-foreground">
                {m.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
