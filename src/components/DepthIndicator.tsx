interface Props {
  depth: number; // 0-6
}

export function DepthIndicator({ depth }: Props) {
  const pct = Math.round((depth / 6) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
        Prompt Depth
      </span>
      <div className="flex gap-0.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-3 rounded-sm transition-colors ${
              i < depth ? "bg-gold" : "bg-secondary"
            }`}
          />
        ))}
      </div>
      <span className="text-[9px] font-mono text-muted-foreground">{pct}%</span>
    </div>
  );
}
