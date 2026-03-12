import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function Footer() {
  const { user } = useAuth();

  return (
    <footer style={{ background: "hsl(228, 35%, 12%)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ maxWidth: 1120 }} className="mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div>
            <span className="text-lg font-bold" style={{ color: "#FFFFFF" }}>
              StratOS
            </span>
            <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>
              AI decision audits for executives
            </p>
            <p className="mt-4 text-xs" style={{ color: "#6B7280", opacity: 0.6 }}>
              © 2026 StratOS
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: "#FFFFFF" }}>
              Product
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link
                to="/"
                className="text-sm transition-opacity hover:opacity-80"
                style={{ color: "#6B7280" }}
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className="text-sm transition-opacity hover:opacity-80"
                style={{ color: "#6B7280" }}
              >
                Pricing
              </Link>
              {user && (
                <>
                  <Link
                    to="/journal"
                    className="text-sm transition-opacity hover:opacity-80"
                    style={{ color: "#6B7280" }}
                  >
                    Journal
                  </Link>
                  <Link
                    to="/dashboard"
                    className="text-sm transition-opacity hover:opacity-80"
                    style={{ color: "#6B7280" }}
                  >
                    Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: "#FFFFFF" }}>
              Legal
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/privacy" className="text-sm transition-opacity hover:opacity-80" style={{ color: "#6B7280" }}>
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm transition-opacity hover:opacity-80" style={{ color: "#6B7280" }}>
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs" style={{ color: "#6B7280", opacity: 0.4 }}>
            Built on: MECE · Risk Matrix · Stakeholder Analysis · Cynefin · Pre-Mortem · RAPID
          </p>
        </div>
      </div>
    </footer>
  );
}
