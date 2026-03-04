interface Props {
  level: number; // 0-5
}

const labels = ["", "Minimal", "Basic", "Good", "Strong", "Expert"];

export function SignalMeter({ level }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-sm transition-all duration-200 ${
              i < level ? "bg-gold" : "bg-secondary"
            }`}
            style={{ height: `${8 + i * 3}px` }}
          />
        ))}
      </div>
      {level > 0 && (
        <span className="text-[10px] font-mono uppercase tracking-wider text-gold">
          {labels[level]}
        </span>
      )}
    </div>
  );
}
