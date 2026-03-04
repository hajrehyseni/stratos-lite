import { useEffect, useState } from "react";

interface Props {
  label?: string;
  delay?: number;
  onComplete?: () => void;
}

export function TypingIndicator({ label, delay, onComplete }: Props) {
  useEffect(() => {
    if (delay && onComplete) {
      const t = setTimeout(onComplete, delay);
      return () => clearTimeout(t);
    }
  }, [delay, onComplete]);

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-gold"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      {label && <span className="text-xs text-muted-foreground font-mono">{label}</span>}
    </div>
  );
}
