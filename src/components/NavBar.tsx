import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface Props {
  depth?: number;
  journalCount: number;
}

export function NavBar({ depth, journalCount }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? "rgba(10,10,10,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
        <Link to="/" className="font-headline text-base tracking-wide text-foreground hover:text-gold transition-colors">
          StratOS
        </Link>

        <div className="flex items-center gap-4">
          {depth !== undefined && depth > 0 && (
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                Depth
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-2.5 rounded-sm transition-colors ${
                      i < depth ? "bg-gold" : "bg-secondary"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-green" />
            <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
              Private Session
            </span>
          </div>

          {journalCount > 0 && (
            <Link
              to="/journal"
              className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground hover:text-gold transition-colors"
            >
              Journal →
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
