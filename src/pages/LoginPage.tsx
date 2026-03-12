import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error(String(error));
  };

  const inputStyle = {
    background: "#0F0F0F",
    border: "1px solid rgba(255,255,255,0.1)",
    height: 48,
    fontSize: 14,
    color: "hsl(var(--foreground))",
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center" style={{ maxWidth: 900 }}>
          {/* Left: Form */}
          <div className="w-full" style={{ maxWidth: 400 }}>
            <h1 className="text-2xl font-semibold mb-2" style={{ color: "hsl(var(--foreground))" }}>
              Welcome back
            </h1>
            <p className="mb-8 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              Your decisions are waiting.
            </p>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 rounded-lg transition-all duration-200 mb-6 hover:scale-[1.01] active:scale-[0.99]"
              style={{ ...inputStyle, background: "#0F0F0F" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
              <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>or</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email" required
                className="w-full rounded-lg px-4 bg-transparent outline-none transition-colors focus:border-primary/40"
                style={inputStyle}
              />
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" required
                className="w-full rounded-lg px-4 bg-transparent outline-none transition-colors focus:border-primary/40"
                style={inputStyle}
              />
              <button
                type="submit" disabled={loading}
                className="w-full rounded-lg font-semibold transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  height: 48, fontSize: 14,
                  background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-center mt-6 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              Don't have an account?{" "}
              <Link to="/signup" style={{ color: "hsl(var(--primary))" }}>Sign up</Link>
            </p>
          </div>

          {/* Right: Value panel */}
          <div
            className="hidden md:block rounded-2xl p-8"
            style={{ background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <h3 className="text-base font-semibold mb-6" style={{ color: "hsl(var(--foreground))" }}>
              Your recent audits
            </h3>
            <div className="space-y-4 opacity-60">
              {[
                { decision: "Should we acquire CompetitorX?", score: 62, verdict: "CONDITIONAL PROCEED" },
                { decision: "Should we expand into APAC market?", score: 78, verdict: "PROCEED" },
              ].map((mock, i) => (
                <div key={i} className="rounded-lg px-4 py-3" style={{ background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-sm truncate mb-2" style={{ color: "hsl(var(--foreground))" }}>{mock.decision}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: "hsl(var(--primary))" }}>{mock.score}/100</span>
                    <span
                      className="rounded-full w-2 h-2"
                      style={{ background: mock.verdict === "PROCEED" ? "#22c55e" : "hsl(var(--primary))" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
