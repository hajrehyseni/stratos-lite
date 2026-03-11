import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getJournalCount } from "@/lib/journal";
import { useAuth } from "@/contexts/AuthContext";
import { AccountMenu } from "@/components/AccountMenu";
import { Menu, X } from "lucide-react";

interface Props {
  journalCount?: number;
}

export function NavBar({ journalCount }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const count = journalCount ?? getJournalCount();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, []);

  const navLinkStyle = { fontSize: 13, color: "hsl(var(--muted-foreground))" };

  return (
    <>
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

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/pricing" className="transition-colors hover:opacity-80" style={navLinkStyle}>
              Pricing
            </Link>

            {user && count >= 1 && (
              <Link to="/journal" className="transition-colors hover:opacity-80" style={navLinkStyle}>
                Journal
              </Link>
            )}

            {user && count >= 5 && (
              <Link
                to="/dashboard"
                className="transition-colors hover:opacity-80 flex items-center gap-1.5"
                style={{ fontSize: 13, color: "hsl(var(--primary))" }}
              >
                Dashboard
                <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: "hsl(var(--primary))" }} />
              </Link>
            )}

            {user ? (
              <AccountMenu />
            ) : (
              <Link to="/login" className="transition-colors hover:opacity-80" style={{ fontSize: 13, color: "hsl(var(--foreground))" }}>
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            style={{ color: "hsl(var(--foreground))" }}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobile slide-in panel */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <div
            className="fixed top-0 right-0 bottom-0 z-[70] flex flex-col"
            style={{
              width: 280,
              background: "#0A0A0A",
              borderLeft: "1px solid #1A1A1A",
              animation: "slideInFromRight 200ms ease forwards",
            }}
          >
            <div className="flex items-center justify-between px-4 h-16">
              <span style={{ fontSize: 14, fontWeight: 600, color: "hsl(var(--foreground))" }}>Menu</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" style={{ color: "hsl(var(--foreground))" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-1 px-4">
              <Link
                to="/pricing"
                onClick={() => setMobileOpen(false)}
                className="py-3 transition-colors hover:opacity-80"
                style={navLinkStyle}
              >
                Pricing
              </Link>

              {user && count >= 1 && (
                <Link
                  to="/journal"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 transition-colors hover:opacity-80"
                  style={navLinkStyle}
                >
                  Journal
                </Link>
              )}

              {user && count >= 5 && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 transition-colors hover:opacity-80"
                  style={{ fontSize: 13, color: "hsl(var(--primary))" }}
                >
                  Dashboard
                </Link>
              )}

              <div style={{ height: 1, background: "#1A1A1A", margin: "8px 0" }} />

              {user ? (
                <div className="py-3">
                  <AccountMenu />
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 transition-colors hover:opacity-80"
                  style={{ fontSize: 13, color: "hsl(var(--foreground))" }}
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
