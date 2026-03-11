import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { NavBar } from "@/components/NavBar";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email to confirm your account");
    }
  };

  const handleGoogleSignup = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error(String(error));
  };

  const cardBase = { background: "#0F0F0F", border: "1px solid #1A1A1A" };

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full" style={{ maxWidth: 400 }}>
          <h1 className="text-center mb-2" style={{ fontSize: 24, fontWeight: 600, color: "hsl(var(--foreground))" }}>
            Create your account
          </h1>
          <p className="text-center mb-8" style={{ fontSize: 14, color: "hsl(var(--muted-foreground))" }}>
            Get 3 free audits. No credit card required.
          </p>

          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 rounded-lg transition-all duration-200 mb-6"
            style={{ ...cardBase, height: 48, fontSize: 14, color: "hsl(var(--foreground))" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1A1A1A"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#0F0F0F"; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1" style={{ height: 1, background: "hsl(var(--border))" }} />
            <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>or</span>
            <div className="flex-1" style={{ height: 1, background: "hsl(var(--border))" }} />
          </div>

          <form onSubmit={handleEmailSignup} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full rounded-lg px-4 bg-transparent outline-none"
              style={{ ...cardBase, height: 48, fontSize: 14, color: "hsl(var(--foreground))" }}
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              required
              minLength={6}
              className="w-full rounded-lg px-4 bg-transparent outline-none"
              style={{ ...cardBase, height: 48, fontSize: 14, color: "hsl(var(--foreground))" }}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg font-semibold transition-all duration-200"
              style={{
                height: 48, fontSize: 14,
                background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-6" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "hsl(var(--primary))" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
