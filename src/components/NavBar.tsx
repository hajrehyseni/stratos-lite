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

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? "hsla(228, 35%, 16%, 0.95)" : "hsla(228, 35%, 16%, 0.8)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        }}
      >
        <div style={{ maxWidth: 1120 }} className="mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity"
            style={{ color: "#FFFFFF" }}
          >
            StratOS
          </Link>

          {/* Desktop nav — hidden below md */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/pricing"
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Pricing
            </Link>

            {user && count >= 1 && (
              <Link
                to="/journal"
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Journal
              </Link>
            )}

            {user && count >= 5 && (
              <Link
                to="/dashboard"
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Dashboard
              </Link>
            )}

            {!user && (
              <Link
                to="/login"
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Sign in
              </Link>
            )}

            {user && <AccountMenu />}

            {/* Single nav CTA — ghost/outlined style so it doesn't compete with page CTAs */}
            <button
              onClick={handleCTA}
              className="rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "transparent",
                color: "#FFFFFF",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "transparent"; }}
            >
              {user ? "New Audit" : "Get Started"}
            </button>
          </div>

          {/* Mobile: hamburger only — hidden at md+ */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="p-2"
              style={{ color: "#FFFFFF" }}
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
              background: "hsl(228, 35%, 14%)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-center justify-between px-4 h-16">
              <span className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
                Menu
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="p-2"
                style={{ color: "#FFFFFF" }}
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
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Home
                </Link>
              )}
              <Link
                to="/pricing"
                onClick={() => setMobileOpen(false)}
                className="py-3 text-sm transition-colors hover:opacity-80"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Pricing
              </Link>

              {user && count >= 1 && (
                <Link
                  to="/journal"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm transition-colors hover:opacity-80"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Journal
                </Link>
              )}

              {user && count >= 5 && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm transition-colors hover:opacity-80"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Dashboard
                </Link>
              )}

              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "8px 0" }} />

              {user ? (
                <div className="py-3">
                  <AccountMenu />
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm transition-colors hover:opacity-80"
                  style={{ color: "#FFFFFF" }}
                >
                  Sign in
                </Link>
              )}
            </div>

            {/* Bottom CTA in mobile menu */}
            <div className="px-4 pb-6">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleCTA();
                }}
                className="w-full rounded-full py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: "hsl(16, 100%, 62%)",
                  color: "#FFFFFF",
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
