import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

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
        backgroundColor: scrolled ? "rgba(8,8,8,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #1A1A1A" : "1px solid transparent",
      }}
    >
      <div className="max-w-[720px] mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="text-[18px] font-semibold hover:opacity-80 transition-opacity"
          style={{ color: "#fff", letterSpacing: "-0.01em" }}
        >
          StratOS
        </Link>

        <div className="flex items-center gap-4">
          {journalCount > 0 && (
            <Link
              to="/journal"
              className="text-[12px] transition-colors hover:opacity-80"
              style={{ color: "rgba(232,228,223,0.5)" }}
            >
              Journal →
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
