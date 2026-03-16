import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex items-center justify-center px-4 pt-16 page-enter">
        <div className="w-full" style={{ maxWidth: 420 }}>
          {!sent ? (
            <>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "hsl(var(--text-primary))" }}>
                Reset your password
              </h1>
              <p className="mb-8 text-lg" style={{ color: "hsl(var(--text-secondary))" }}>
                Enter your email and we'll send you a reset link
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="sr-only">Email</label>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full rounded-xl px-5 outline-none transition-all duration-200"
                    style={{
                      background: "hsla(0, 0%, 100%, 0.08)",
                      border: "1.5px solid hsla(0, 0%, 100%, 0.15)",
                      height: 52,
                      fontSize: 16,
                      color: "hsl(var(--text-primary))",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "hsl(var(--primary))";
                      e.currentTarget.style.boxShadow = "0 0 0 3px hsla(16, 100%, 62%, 0.12)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "hsla(0, 0%, 100%, 0.15)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    height: 52,
                    fontSize: 16,
                    background: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                    boxShadow: "0 4px 16px hsla(16, 100%, 62%, 0.3)",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>

              <p className="text-center mt-8">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-base transition-opacity hover:opacity-80"
                  style={{ color: "hsl(var(--text-secondary))" }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div
                className="mx-auto mb-6 flex items-center justify-center rounded-full"
                style={{ width: 64, height: 64, background: "hsla(160, 84%, 39%, 0.15)" }}
              >
                <span style={{ fontSize: 28 }}>✉️</span>
              </div>
              <h1 className="text-2xl font-bold mb-3" style={{ color: "hsl(var(--text-primary))" }}>
                Check your inbox
              </h1>
              <p className="text-lg mb-8" style={{ color: "hsl(var(--text-secondary))" }}>
                We've sent a reset link to <strong style={{ color: "hsl(var(--text-primary))" }}>{email}</strong>
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-base font-semibold transition-opacity hover:opacity-80"
                style={{ color: "hsl(var(--primary))" }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
