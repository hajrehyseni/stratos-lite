import { useState, useEffect } from "react";

interface Props {
  level: number; // 0-5
}

const labels = ["", "Minimal", "Basic", "Good", "Strong", "Expert"];

export function SignalMeter({ level }: Props) {
  const [prevLevel, setPrevLevel] = useState(level);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (level !== prevLevel) {
      setAnimating(true);
      setPrevLevel(level);
      const t = setTimeout(() => setAnimating(false), 300);
      return () => clearTimeout(t);
    }
  }, [level, prevLevel]);

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
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
      {level > 0 && (
        <span
          key={level}
          className="font-mono uppercase tracking-wider scale-fade-in"
          style={{ fontSize: "9px", color: "#FFB800" }}
        >
          {labels[level]}
        </span>
      )}
    </div>
  );
}
