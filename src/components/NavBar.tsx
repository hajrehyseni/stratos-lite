import { Link } from "react-router-dom";

interface Props {
  depth?: number;
  journalCount: number;
}

export function NavBar({ depth, journalCount }: Props) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
        {/* Left: brand */}
        <Link to="/" className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
          StratOS
        </Link>

        {/* Right: indicators */}
        <div className="flex items-center gap-4">
          {/* Prompt depth - only during diagnostic */}
          {depth !== undefined && depth > 0 && (
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                Prompt Depth
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-2.5 rounded-sm ${
                      i < depth ? "bg-gold" : "bg-secondary"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono text-muted-foreground">
                {Math.round((depth / 6) * 100)}%
              </span>
            </div>
          )}

          {/* Privacy dot */}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-green" />
            <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
              Private Session
            </span>
          </div>

          {/* Journal link */}
          {journalCount > 0 && (
            <Link
              to="/journal"
              className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground hover:text-gold transition-colors"
            >
              My Journal →
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
