import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer style={{ background: "#050505", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div>
            <span className="text-lg font-semibold" style={{ color: "hsl(var(--foreground))" }}>
              StratOS
            </span>
            <p className="mt-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              AI decision audits for executives
            </p>
            <p className="mt-4 text-xs" style={{ color: "hsl(var(--muted-foreground))", opacity: 0.5 }}>
              © 2026 StratOS
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: "hsl(var(--foreground))" }}>
              Product
            </h4>
            <div className="flex flex-col gap-2.5">
              {[
                { to: "/", label: "Home" },
                { to: "/pricing", label: "Pricing" },
                { to: "/journal", label: "Journal" },
                { to: "/dashboard", label: "Dashboard" },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-sm transition-opacity hover:opacity-80"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: "hsl(var(--foreground))" }}>
              Legal
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/privacy" className="text-sm transition-opacity hover:opacity-80" style={{ color: "hsl(var(--muted-foreground))" }}>
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm transition-opacity hover:opacity-80" style={{ color: "hsl(var(--muted-foreground))" }}>
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))", opacity: 0.4 }}>
            Built on: MECE · Risk Matrix · Stakeholder Analysis · Cynefin · Pre-Mortem · RAPID
          </p>
        </div>
      </div>
    </footer>
  );
}
