import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SignupGate({ open, onClose }: Props) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl p-10 w-full text-center"
        style={{ maxWidth: 460, background: "hsl(228, 35%, 14%)", border: "1px solid hsla(0, 0%, 100%, 0.1)" }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2" style={{ color: "hsl(var(--text-tertiary))", minWidth: 44, minHeight: 44 }} aria-label="Close">
          <X className="w-5 h-5" />
        </button>

        <h2 className="mt-4 text-xl font-bold" style={{ color: "hsl(var(--text-primary))" }}>
          Create a free account
        </h2>
        <p className="mt-3 mx-auto text-base" style={{ color: "hsl(var(--text-secondary))", maxWidth: 320, lineHeight: 1.6 }}>
          Save your decision history and unlock 3 free audits. No credit card required.
        </p>

        <button
          onClick={() => { onClose(); navigate("/signup"); }}
          className="mt-8 w-full rounded-full py-3.5 font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{ fontSize: 16, background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", boxShadow: "0 4px 16px hsla(16, 100%, 62%, 0.3)", minHeight: 52 }}
        >
          Create Free Account
        </button>
        <button
          onClick={() => { onClose(); navigate("/login"); }}
          className="mt-3 w-full rounded-full py-3.5 transition-all duration-200"
          style={{ fontSize: 15, border: "1px solid hsla(0, 0%, 100%, 0.15)", color: "hsl(var(--text-secondary))", background: "transparent", minHeight: 48 }}
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
}
