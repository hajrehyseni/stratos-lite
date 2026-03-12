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
        className="relative rounded-xl p-8 w-full text-center"
        style={{ maxWidth: 440, background: "hsl(228, 35%, 14%)", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2" style={{ color: "#6B7280" }} aria-label="Close">
          <X className="w-5 h-5" />
        </button>

        <h2 className="mt-4" style={{ fontSize: 22, fontWeight: 600, color: "#FFFFFF" }}>
          Create a free account
        </h2>
        <p className="mt-2 mx-auto" style={{ fontSize: 14, color: "#6B7280", maxWidth: 320, lineHeight: 1.6 }}>
          Save your decision history and unlock 3 free audits. No credit card required.
        </p>

        <button
          onClick={() => { onClose(); navigate("/signup"); }}
          className="mt-6 w-full rounded-full py-3 font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{ fontSize: 14, background: "hsl(16, 100%, 62%)", color: "#FFFFFF" }}
        >
          Create Free Account
        </button>
        <button
          onClick={() => { onClose(); navigate("/login"); }}
          className="mt-3 w-full rounded-full py-3 transition-all duration-200"
          style={{ fontSize: 14, border: "1px solid rgba(255,255,255,0.15)", color: "#6B7280", background: "transparent" }}
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
}
