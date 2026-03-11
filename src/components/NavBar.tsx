import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getJournalCount } from "@/lib/journal";
import { useAuth } from "@/contexts/AuthContext";
import { AccountMenu } from "@/components/AccountMenu";

interface Props {
  journalCount?: number;
}

export function NavBar({ journalCount }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const count = journalCount ?? getJournalCount();
  const { user } = useAuth();

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
          <Link
            to="/pricing"
            className="text-[13px] transition-colors hover:opacity-80"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Pricing
          </Link>

          {user && count >= 1 && (
            <Link
              to="/journal"
              className="text-[13px] transition-colors hover:opacity-80"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              Journal
            </Link>
          )}

          {user && count >= 5 && (
            <Link
              to="/dashboard"
              className="text-[13px] transition-colors hover:opacity-80"
              style={{ color: "hsl(var(--primary))" }}
            >
              Dashboard
            </Link>
          )}

          {user ? (
            <AccountMenu />
          ) : (
            <Link
              to="/login"
              className="text-[13px] transition-colors hover:opacity-80"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
