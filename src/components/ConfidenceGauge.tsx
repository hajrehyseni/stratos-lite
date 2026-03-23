import { useEffect, useState } from "react";

interface Props {
  score: number;
  size?: number;
  verdict: string;
  rationale?: string;
}

function getScoreColor(score: number): string {
  if (score <= 30) return "hsl(0, 84%, 60%)";
  if (score <= 60) return "hsl(38, 92%, 50%)";
  if (score <= 80) return "hsl(174, 60%, 45%)";
  return "hsl(160, 84%, 39%)";
}

function getScoreColorVar(score: number): string {
  if (score <= 30) return "var(--destructive)";
  if (score <= 60) return "var(--warning)";
  if (score <= 80) return "174, 60%, 45%";
  return "var(--success)";
}

function getBadgeBg(score: number): string {
  if (score <= 30) return "hsla(0, 84%, 60%, 0.12)";
  if (score <= 60) return "hsla(38, 92%, 50%, 0.12)";
  if (score <= 80) return "hsla(174, 60%, 45%, 0.12)";
  return "hsla(160, 84%, 39%, 0.12)";
}

function getBadgeBorder(score: number): string {
  if (score <= 30) return "hsla(0, 84%, 60%, 0.3)";
  if (score <= 60) return "hsla(38, 92%, 50%, 0.3)";
  if (score <= 80) return "hsla(174, 60%, 45%, 0.3)";
  return "hsla(160, 84%, 39%, 0.3)";
}

export function ConfidenceGauge({ score, size = 160, verdict, rationale }: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const color = getScoreColor(score);

  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 0.05s linear",
              filter: `drop-shadow(0 0 8px ${color}40)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-extrabold" style={{ fontSize: size * 0.3, color, lineHeight: 1 }}>
            {animatedScore}
          </span>
          <span className="font-medium" style={{ fontSize: size * 0.1, color: "hsl(var(--text-tertiary))", marginTop: 2 }}>
            /100
          </span>
        </div>
      </div>

      {/* Verdict badge */}
      <div
        className="mt-4 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold"
        style={{
          background: getBadgeBg(score),
          border: `1px solid ${getBadgeBorder(score)}`,
          color,
          letterSpacing: "0.05em",
        }}
      >
        {verdict}
      </div>

      {/* Rationale */}
      {rationale && (
        <p className="mt-3 text-center text-base" style={{ color: "hsl(var(--text-secondary))", maxWidth: 480, lineHeight: 1.6 }}>
          {rationale}
        </p>
      )}
    </div>
  );
}
