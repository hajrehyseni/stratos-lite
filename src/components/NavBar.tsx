import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AccountMenu } from "@/components/AccountMenu";
import { StratOSLogo } from "@/components/StratOSLogo";
import { Menu, X } from "lucide-react";

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Lock body scroll when bottom sheet is open
  useEffect(() => {
    if (mobileOpen) { document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleCTA = () => {
    if (user) {
      if (isHome) {
        const input = document.querySelector<HTMLInputElement>("#hero-input") || document.querySelector<HTMLInputElement>("#hero-input-mobile");
        if (input) { input.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => input.focus(), 400); }
      } else { navigate("/"); }
    } else { navigate("/signup"); }
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkStyle = (path: string) => ({
    color: isActive(path) ? "hsl(var(--primary))" : "hsl(var(--text-secondary))",
    borderBottom: isActive(path) ? "2px solid hsl(var(--primary))" : "2px solid transparent",
    paddingBottom: 2,
  });

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? "hsla(0, 0%, 100%, 0.95)" : "hsla(0, 0%, 100%, 0.8)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: scrolled ? "1px solid hsl(var(--border))" : "1px solid transparent",
        }}
      >
        <div style={{ maxWidth: 1120 }} className="mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <StratOSLogo size={28} />
            <span className="text-xl font-bold tracking-tight" style={{ color: "hsl(var(--text-primary))" }}>StratOS</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/pricing" className="text-base font-medium transition-colors hover:opacity-70" style={navLinkStyle("/pricing")}>Pricing</Link>
            {user && (
              <>
                <Link to="/dashboard" className="text-base font-medium transition-colors hover:opacity-70" style={navLinkStyle("/dashboard")}>Dashboard</Link>
                <Link to="/journal" className="text-base font-medium transition-colors hover:opacity-70" style={navLinkStyle("/journal")}>Journal</Link>
              </>
            )}
            {!user && <Link to="/login" className="text-base font-medium transition-colors hover:opacity-70" style={navLinkStyle("/login")}>Sign in</Link>}
            
            <div style={{ width: 1, height: 24, background: "hsl(var(--border))" }} />

            {user && <AccountMenu />}
            <button
              onClick={handleCTA}
              className="rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", minHeight: 40 }}
            >
              {user ? "New Audit" : "Get Started"}
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="p-2" style={{ color: "hsl(var(--text-primary))", minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile bottom sheet */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-[60]" style={{ background: "hsla(0, 0%, 0%, 0.4)" }} onClick={() => setMobileOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-[70] flex flex-col bottom-sheet-up" style={{ background: "hsl(0, 0%, 100%)", borderRadius: "16px 16px 0 0", maxHeight: "70vh", boxShadow: "0 -8px 40px hsla(0, 0%, 0%, 0.12)" }}>
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="rounded-full" style={{ width: 36, height: 4, background: "hsl(var(--border))" }} />
            </div>

            <div className="flex flex-col gap-0 px-6 flex-1 overflow-y-auto pb-4">
              {[
                { to: "/", label: "Home", active: isHome },
                { to: "/pricing", label: "Pricing", active: isActive("/pricing") },
                ...(user ? [
                  { to: "/dashboard", label: "Dashboard", active: isActive("/dashboard") },
                  { to: "/journal", label: "Journal", active: isActive("/journal") },
                  { to: "/settings", label: "Settings", active: isActive("/settings") },
                ] : []),
              ].map(link => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="flex items-center text-base font-medium transition-colors" style={{ color: link.active ? "hsl(var(--primary))" : "hsl(var(--text-secondary))", height: 56, borderBottom: "1px solid hsl(var(--border))" }}>
                  {link.label}
                </Link>
              ))}

              {user ? <div className="py-3"><AccountMenu /></div> : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center text-base font-medium transition-colors" style={{ color: "hsl(var(--text-primary))", height: 56 }}>Sign in</Link>
              )}
            </div>

            <div className="px-6 pb-8 pt-2">
              <button onClick={() => { setMobileOpen(false); handleCTA(); }} className="w-full rounded-full py-3.5 text-base font-semibold transition-all duration-200 active:scale-[0.98]" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", minHeight: 52 }}>
                {user ? "New Audit" : "Get Started"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
