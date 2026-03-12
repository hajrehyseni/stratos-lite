import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleCTA = () => {
    if (isHome) {
      const input = document.querySelector<HTMLInputElement>("#hero-input");
      if (input) {
        input.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => input.focus(), 400);
      }
    } else {
      navigate("/");
    }
  };

  const ctaLabel = user ? "New Audit" : "Try Free Audit";

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(8,8,8,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight hover:opacity-80 transition-opacity"
            style={{ color: "hsl(var(--foreground))" }}
          >
            StratOS
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/pricing"
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              Pricing
            </Link>

            {user && count >= 1 && (
              <Link
                to="/journal"
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                Journal
              </Link>
            )}

            {user && count >= 5 && (
              <Link
                to="/dashboard"
                className="text-sm transition-colors hover:opacity-80 flex items-center gap-1.5"
                style={{ color: "hsl(var(--primary))" }}
              >
                Dashboard
                <span
                  className="inline-block rounded-full"
                  style={{ width: 6, height: 6, background: "hsl(var(--primary))" }}
                />
              </Link>
            )}

            {!user && (
              <Link
                to="/login"
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: "hsl(var(--foreground))" }}
              >
                Sign in
              </Link>
            )}

            {user && <AccountMenu />}

            <button
              onClick={handleCTA}
              className="rounded-full px-5 py-2 text-sm font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
              }}
            >
              {ctaLabel}
            </button>
          </div>

          {/* Mobile: CTA + hamburger */}
          <div className="md:hidden flex items-center gap-3">
            {!isHome && (
              <button
                onClick={handleCTA}
                className="rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
                style={{
                  background: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                }}
              >
                {ctaLabel}
              </button>
            )}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              style={{ color: "hsl(var(--foreground))" }}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-in panel */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="fixed top-0 right-0 bottom-0 z-[70] flex flex-col animate-slide-in-right"
            style={{
              width: 280,
              background: "#0A0A0A",
              borderLeft: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div className="flex items-center justify-between px-4 h-16">
              <span className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                Menu
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                style={{ color: "hsl(var(--foreground))" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-1 px-4 flex-1">
              {!isHome && (
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm transition-colors hover:opacity-80"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  Home
                </Link>
              )}
              <Link
                to="/pricing"
                onClick={() => setMobileOpen(false)}
                className="py-3 text-sm transition-colors hover:opacity-80"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                Pricing
              </Link>

              {user && count >= 1 && (
                <Link
                  to="/journal"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm transition-colors hover:opacity-80"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  Journal
                </Link>
              )}

              {user && count >= 5 && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm transition-colors hover:opacity-80"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  Dashboard
                </Link>
              )}

              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "8px 0" }} />

              {user ? (
                <div className="py-3">
                  <AccountMenu />
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm transition-colors hover:opacity-80"
                  style={{ color: "hsl(var(--foreground))" }}
                >
                  Sign in
                </Link>
              )}
            </div>

            {/* Bottom CTA */}
            {!isHome && (
              <div className="px-4 pb-6">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleCTA();
                  }}
                  className="w-full rounded-full py-3 text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
                  style={{
                    background: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                  }}
                >
                  {ctaLabel}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
