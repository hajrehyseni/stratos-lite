import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery event from URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully");
      navigate("/");
    }
  };

  if (!isRecovery) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center px-4 pt-16 page-enter">
          <div className="text-center" style={{ maxWidth: 420 }}>
            <h1 className="text-2xl font-bold mb-3" style={{ color: "hsl(var(--text-primary))" }}>
              Invalid reset link
            </h1>
            <p className="text-lg mb-6" style={{ color: "hsl(var(--text-secondary))" }}>
              This link has expired or is invalid. Please request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="text-base font-semibold"
              style={{ color: "hsl(var(--primary))" }}
            >
              Request new reset link
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex items-center justify-center px-4 pt-16 page-enter">
        <div className="w-full" style={{ maxWidth: 420 }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "hsl(var(--text-primary))" }}>
            Set new password
          </h1>
          <p className="mb-8 text-lg" style={{ color: "hsl(var(--text-secondary))" }}>
            Enter your new password below
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="sr-only">New password</label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password (min 6 characters)"
                required
                minLength={6}
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
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirm password</label>
              <input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
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
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
