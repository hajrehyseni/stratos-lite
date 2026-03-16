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
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      navigate(redirect ? `/${redirect}` : "/");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error(String(error));
  };

  // Forgot password is now handled by /forgot-password page

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex items-center justify-center px-4 pt-16 page-enter">
        <div className="w-full" style={{ maxWidth: 420 }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "hsl(var(--text-primary))" }}>
            Welcome back
          </h1>
          <p className="mb-8 text-lg" style={{ color: "hsl(var(--text-secondary))" }}>
            Your decisions are waiting.
          </p>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 rounded-full transition-all duration-200 mb-6 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              height: 56, fontSize: 16, fontWeight: 600,
              background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))",
              boxShadow: "0 4px 16px hsla(16, 100%, 62%, 0.3)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#fff"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" opacity="0.8"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff" opacity="0.6"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" opacity="0.9"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: "hsla(0, 0%, 100%, 0.08)" }} />
            <span className="text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "hsla(0, 0%, 100%, 0.08)" }} />
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="sr-only">Email</label>
              <input
                id="login-email"
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email" required
                className="w-full rounded-xl px-5 outline-none transition-all duration-200"
                style={{
                  background: "hsla(0, 0%, 100%, 0.08)",
                  border: "1.5px solid hsla(0, 0%, 100%, 0.15)",
                  height: 52, fontSize: 16, color: "hsl(var(--text-primary))",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "hsl(var(--primary))"; e.currentTarget.style.boxShadow = "0 0 0 3px hsla(16, 100%, 62%, 0.12)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "hsla(0, 0%, 100%, 0.15)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
            <div>
              <label htmlFor="login-password" className="sr-only">Password</label>
              <input
                id="login-password"
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" required
                className="w-full rounded-xl px-5 outline-none transition-all duration-200"
                style={{
                  background: "hsla(0, 0%, 100%, 0.08)",
                  border: "1.5px solid hsla(0, 0%, 100%, 0.15)",
                  height: 52, fontSize: 16, color: "hsl(var(--text-primary))",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "hsl(var(--primary))"; e.currentTarget.style.boxShadow = "0 0 0 3px hsla(16, 100%, 62%, 0.12)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "hsla(0, 0%, 100%, 0.15)"; e.currentTarget.style.boxShadow = "none"; }}
              />
              <Link
                to="/forgot-password"
                className="mt-2 inline-block text-base transition-opacity hover:opacity-80"
                style={{ color: "hsl(var(--primary))", minHeight: 44 }}
              >
                Forgot password?
              </Link>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                height: 52, fontSize: 16,
                background: "transparent",
                color: "hsl(var(--text-primary))",
                border: "1.5px solid hsla(0, 0%, 100%, 0.2)",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center mt-8 text-base" style={{ color: "hsl(var(--text-secondary))" }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "hsl(var(--primary))", fontWeight: 600 }}>Sign up</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
