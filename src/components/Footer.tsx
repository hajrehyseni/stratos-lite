import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function Footer() {
  const { user } = useAuth();

  return (
    <footer style={{ background: "hsl(var(--navy-surface))", borderTop: "1px solid hsla(0, 0%, 100%, 0.08)" }}>
      <div style={{ maxWidth: 1120 }} className="mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-xl font-bold" style={{ color: "hsl(var(--text-primary))" }}>
              StratOS
            </span>
            <p className="mt-2 text-base" style={{ color: "hsl(var(--text-secondary))" }}>
              AI decision audits for executives
            </p>
            <p className="mt-4 text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>
              © 2026 StratOS
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: "hsl(var(--text-primary))" }}>
              Product
            </h4>
            <div className="flex flex-col gap-3">
              {!user ? (
                <a
                  href="/#how-it-works"
                  className="text-base transition-opacity hover:opacity-80"
                  style={{ color: "hsl(var(--text-secondary))" }}
                >
                  Features
                </a>
              ) : null}
              <Link
                to="/pricing"
                className="text-base transition-opacity hover:opacity-80"
                style={{ color: "hsl(var(--text-secondary))" }}
              >
                Pricing
              </Link>
              {user && (
                <>
                  <Link
                    to="/journal"
                    className="text-base transition-opacity hover:opacity-80"
                    style={{ color: "hsl(var(--text-secondary))" }}
                  >
                    Journal
                  </Link>
                  <Link
                    to="/dashboard"
                    className="text-base transition-opacity hover:opacity-80"
                    style={{ color: "hsl(var(--text-secondary))" }}
                  >
                    Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: "hsl(var(--text-primary))" }}>
              Legal
            </h4>
            <div className="flex flex-col gap-3">
              <Link to="/privacy" className="text-base transition-opacity hover:opacity-80" style={{ color: "hsl(var(--text-secondary))" }}>
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-base transition-opacity hover:opacity-80" style={{ color: "hsl(var(--text-secondary))" }}>
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm" style={{ color: "hsl(var(--text-faint))" }}>
            Built on: MECE · Risk Matrix · Stakeholder Analysis · Cynefin · Pre-Mortem · RAPID
          </p>
        </div>
      </div>
    </footer>
  );
}
