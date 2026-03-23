import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/welcome` } });
    setLoading(false);
    if (error) { toast.error(error.message); } else { toast.success("Check your email to confirm your account"); }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/welcome` });
      if (result.error) { const msg = String(result.error); toast.error(msg.includes("configuration") || msg.includes("provider") ? "Google login is not yet configured. Please use email/password to sign up." : msg); }
    } catch (e: any) { toast.error(e?.message || "Google signup failed."); }
    finally { setGoogleLoading(false); }
  };

  const inputStyle = { background: "hsl(var(--secondary))", border: "1.5px solid hsl(var(--border))", height: 52, fontSize: 16, color: "hsl(var(--text-primary))" };
  const benefits = ["3 free strategic decision audits", "Confidence score calibrated to your context", "MECE breakdown + risk matrix + stakeholder map", "Devil's advocate that challenges your strongest assumption", "Your data is encrypted and private"];

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex items-center justify-center px-4 pt-16 page-enter" style={{ background: "hsl(var(--background))" }}>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center" style={{ maxWidth: 900 }}>
          <div className="w-full" style={{ maxWidth: 420 }}>
            <p className="text-sm font-medium mb-4" style={{ color: "hsl(var(--text-tertiary))" }}>Join 12,400+ leaders making better decisions</p>
            <h1 className="text-3xl font-bold mb-2" style={{ color: "hsl(var(--text-primary))" }}>Start auditing decisions for free</h1>
            <p className="mb-8 text-lg" style={{ color: "hsl(var(--text-secondary))" }}>No credit card. 3 audits included.</p>

            <button onClick={handleGoogleSignup} disabled={googleLoading} className="w-full flex items-center justify-center gap-3 rounded-full transition-all duration-200 mb-6 hover:scale-[1.02] active:scale-[0.98]" style={{ height: 56, fontSize: 16, fontWeight: 600, background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", opacity: googleLoading ? 0.7 : 1 }}>
              {googleLoading ? <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : (
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#fff"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" opacity="0.8"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff" opacity="0.6"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" opacity="0.9"/></svg>
              )}
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px" style={{ background: "hsl(var(--border))" }} />
              <span className="text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>or</span>
              <div className="flex-1 h-px" style={{ background: "hsl(var(--border))" }} />
            </div>

            <form onSubmit={handleEmailSignup} className="space-y-4">
              <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full rounded-xl px-5 outline-none transition-all duration-200" style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "hsl(var(--primary))"; e.currentTarget.style.boxShadow = "0 0 0 3px hsla(221, 83%, 53%, 0.12)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "hsl(var(--border))"; e.currentTarget.style.boxShadow = "none"; }}
              />
              <input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 characters)" required minLength={6} className="w-full rounded-xl px-5 outline-none transition-all duration-200" style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "hsl(var(--primary))"; e.currentTarget.style.boxShadow = "0 0 0 3px hsla(221, 83%, 53%, 0.12)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "hsl(var(--border))"; e.currentTarget.style.boxShadow = "none"; }}
              />
              <button type="submit" disabled={loading} className="w-full rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" style={{ height: 52, fontSize: 16, background: "hsl(var(--secondary))", color: "hsl(var(--text-primary))", border: "1.5px solid hsl(var(--border))", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
            <p className="text-center mt-4 text-xs" style={{ color: "hsl(var(--text-tertiary))" }}>🔒 Your first audit is free — no credit card required</p>
            <p className="text-center mt-6 text-base" style={{ color: "hsl(var(--text-secondary))" }}>Already have an account?{" "}<Link to="/login" style={{ color: "hsl(var(--primary))", fontWeight: 600 }}>Sign in</Link></p>
          </div>
          <div className="hidden md:block">
            <div className="rounded-2xl p-8" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
              <h3 className="text-lg font-semibold mb-6" style={{ color: "hsl(var(--text-primary))" }}>What you unlock:</h3>
              <div className="space-y-4">
                {benefits.map((b) => (
                  <div key={b} className="flex items-start gap-3">
                    <span className="mt-0.5 text-base" style={{ color: "hsl(var(--primary))" }}>✓</span>
                    <span className="text-base" style={{ color: "hsl(var(--text-primary))" }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
