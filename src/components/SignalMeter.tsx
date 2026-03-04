interface Props {
  level: number; // 0-5
}

const labels = ["", "Minimal", "Basic", "Good", "Strong", "Expert"];

export function SignalMeter({ level }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex" style={{ gap: "3px" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: "6px",
              height: "12px",
              borderRadius: "2px",
              backgroundColor: i < level ? "#FFB800" : "hsl(0 0% 20%)",
              opacity: i < level ? 1 : 0.2,
              transition: "all 0.2s ease",
            }}
          />
        ))}
      </div>
      {level > 0 && (
        <span className="font-mono uppercase tracking-wider" style={{ fontSize: "9px", color: "#FFB800" }}>
          {labels[level]}
        </span>
      )}
    </div>
  );
}
