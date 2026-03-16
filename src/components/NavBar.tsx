import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getJournalCount } from "@/lib/journal";
import { useAuth } from "@/contexts/AuthContext";
import { STRIPE_TIERS } from "@/lib/stripe-config";
import { AccountMenu } from "@/components/AccountMenu";
import { Menu, X } from "lucide-react";

interface Props {
  journalCount?: number;
}

export function NavBar({ journalCount }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const count = journalCount ?? getJournalCount();
  const { user, subscription } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  const tier = STRIPE_TIERS[subscription.plan];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleCTA = () => {
    if (user) {
      if (isHome) {
        const input = document.querySelector<HTMLInputElement>("#hero-input")
          || document.querySelector<HTMLInputElement>("#hero-input-mobile");
        if (input) {
          input.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => input.focus(), 400);
        }
      } else {
        navigate("/");
      }
    } else {
      navigate("/signup");
    }
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? "hsla(228, 35%, 16%, 0.95)" : "hsla(228, 35%, 16%, 0.8)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: scrolled ? "1px solid hsla(0, 0%, 100%, 0.08)" : "1px solid transparent",
        }}
      >
        <div style={{ maxWidth: 1120 }} className="mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity"
            style={{ color: "hsl(var(--text-primary))" }}
          >
            StratOS
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/pricing"
              className="text-base transition-colors hover:opacity-80"
              style={{ color: "hsl(var(--text-secondary))" }}
            >
              Pricing
            </Link>

            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="text-base transition-colors hover:opacity-80"
                  style={{ color: "hsl(var(--text-secondary))" }}
                >
                  Dashboard
                </Link>
                <Link
                  to="/journal"
                  className="text-base transition-colors hover:opacity-80"
                  style={{ color: "hsl(var(--text-secondary))" }}
                >
                  Journal
                </Link>
              </>
            )}

            {!user && (
              <Link
                to="/login"
                className="text-base transition-colors hover:opacity-80"
                style={{ color: "hsl(var(--text-secondary))" }}
              >
                Sign in
              </Link>
            )}

            {user && (
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ background: "hsla(0, 0%, 100%, 0.08)", color: "hsl(var(--text-secondary))" }}
                >
                  {subscription.auditCount}/{tier.audits}
                </span>
                <AccountMenu />
              </div>
            )}

            <button
              onClick={handleCTA}
              className="rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "transparent",
                color: "hsl(var(--text-primary))",
                border: "1px solid hsla(0, 0%, 100%, 0.2)",
                minHeight: 40,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "hsla(0, 0%, 100%, 0.4)"; e.currentTarget.style.background = "hsla(0, 0%, 100%, 0.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "hsla(0, 0%, 100%, 0.2)"; e.currentTarget.style.background = "transparent"; }}
            >
              {user ? "New Audit" : "Get Started"}
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="p-2"
              style={{ color: "hsl(var(--text-primary))", minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Menu className="w-6 h-6" />
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
              width: 300,
              background: "hsl(228, 35%, 14%)",
              borderLeft: "1px solid hsla(0, 0%, 100%, 0.08)",
            }}
          >
            <div className="flex items-center justify-between px-5 h-16">
              <span className="text-base font-semibold" style={{ color: "hsl(var(--text-primary))" }}>
                Menu
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="p-2"
                style={{ color: "hsl(var(--text-primary))", minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col gap-1 px-5 flex-1">
              {!isHome && (
                <Link to="/" onClick={() => setMobileOpen(false)}
                  className="py-4 text-base transition-colors hover:opacity-80"
                  style={{ color: "hsl(var(--text-secondary))", minHeight: 44 }}>
                  Home
                </Link>
              )}
              <Link to="/pricing" onClick={() => setMobileOpen(false)}
                className="py-4 text-base transition-colors hover:opacity-80"
                style={{ color: "hsl(var(--text-secondary))", minHeight: 44 }}>
                Pricing
              </Link>

              {user && (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                    className="py-4 text-base transition-colors hover:opacity-80"
                    style={{ color: "hsl(var(--text-secondary))", minHeight: 44 }}>
                    Dashboard
                  </Link>
                  <Link to="/journal" onClick={() => setMobileOpen(false)}
                    className="py-4 text-base transition-colors hover:opacity-80"
                    style={{ color: "hsl(var(--text-secondary))", minHeight: 44 }}>
                    Journal
                  </Link>
                  <Link to="/settings" onClick={() => setMobileOpen(false)}
                    className="py-4 text-base transition-colors hover:opacity-80"
                    style={{ color: "hsl(var(--text-secondary))", minHeight: 44 }}>
                    Settings
                  </Link>
                </>
              )}

              <div style={{ height: 1, background: "hsla(0, 0%, 100%, 0.08)", margin: "8px 0" }} />

              {user ? (
                <div className="py-3">
                  <AccountMenu />
                </div>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="py-4 text-base transition-colors hover:opacity-80"
                  style={{ color: "hsl(var(--text-primary))", minHeight: 44 }}>
                  Sign in
                </Link>
              )}
            </div>

            <div className="px-5 pb-6">
              <button
                onClick={() => { setMobileOpen(false); handleCTA(); }}
                className="w-full rounded-full py-3.5 text-base font-semibold transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: "transparent",
                  color: "hsl(var(--text-primary))",
                  border: "1px solid hsla(0, 0%, 100%, 0.2)",
                  minHeight: 48,
                }}
              >
                {user ? "New Audit" : "Get Started"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
