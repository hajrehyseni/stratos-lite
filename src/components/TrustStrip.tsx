import { Layers, Clock, Award } from "lucide-react";

const metrics = [
  { icon: Layers, value: "6 frameworks" },
  { icon: Clock, value: "30 seconds" },
  { icon: Award, value: "10-step audit" },
];

export function TrustStrip() {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-center gap-10 sm:gap-16 px-4 sm:px-6 mx-auto" style={{ maxWidth: 640 }}>
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.value} className="flex flex-col items-center text-center gap-1.5">
              <Icon className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
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
