import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { StratOSLogo } from "@/components/StratOSLogo";

export function Footer() {
  const { user } = useAuth();

  return (
    <footer style={{ background: "hsl(var(--secondary))", borderTop: "1px solid hsl(var(--border))" }}>
      <div style={{ maxWidth: 1120 }} className="mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <StratOSLogo size={24} />
              <span className="text-xl font-bold" style={{ color: "hsl(var(--text-primary))" }}>StratOS</span>
            </div>
            <p className="text-base" style={{ color: "hsl(var(--text-secondary))" }}>Decision intelligence for leaders</p>
            <p className="mt-4 text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>© 2026 StratOS</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: "hsl(var(--text-primary))" }}>Product</h4>
            <div className="flex flex-col gap-3">
              <Link to="/pricing" className="text-base transition-opacity hover:opacity-80" style={{ color: "hsl(var(--text-secondary))" }}>Pricing</Link>
              {user && (
                <>
                  <Link to="/journal" className="text-base transition-opacity hover:opacity-80" style={{ color: "hsl(var(--text-secondary))" }}>Journal</Link>
                  <Link to="/dashboard" className="text-base transition-opacity hover:opacity-80" style={{ color: "hsl(var(--text-secondary))" }}>Dashboard</Link>
                </>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: "hsl(var(--text-primary))" }}>Legal</h4>
            <div className="flex flex-col gap-3">
              <Link to="/privacy" className="text-base transition-opacity hover:opacity-80" style={{ color: "hsl(var(--text-secondary))" }}>Privacy Policy</Link>
              <Link to="/terms" className="text-base transition-opacity hover:opacity-80" style={{ color: "hsl(var(--text-secondary))" }}>Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
