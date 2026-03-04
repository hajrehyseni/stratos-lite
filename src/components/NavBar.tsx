import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Lock } from "lucide-react";

interface Props {
  journalCount?: number;
}

export function NavBar({ journalCount = 0 }: Props) {
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
        backgroundColor: scrolled ? "rgba(8,8,8,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      }}
    >
      <div className="max-w-[680px] mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="text-[18px] font-bold text-foreground hover:opacity-80 transition-opacity"
          style={{ letterSpacing: "-0.01em" }}
        >
          StratOS
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5" style={{ opacity: 0.4 }}>
            <Lock className="w-3 h-3" />
            <span className="text-[12px] text-foreground">Private</span>
          </div>

          {journalCount > 0 && (
            <Link
              to="/journal"
              className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Journal
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
