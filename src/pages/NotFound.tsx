import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const NotFound = () => {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  const canSubmit = value.trim().length >= 10;

  const handleSubmit = () => {
    if (canSubmit) {
      // Navigate to homepage and pass decision via sessionStorage
      sessionStorage.setItem("stratos_prefill", value.trim());
      navigate("/");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div style={{ maxWidth: 480 }}>
        <span style={{ fontSize: 64, fontWeight: 700, color: "hsl(var(--primary))", lineHeight: 1 }}>404</span>
        <p className="mt-4" style={{ fontSize: 16, color: "hsl(var(--muted-foreground))" }}>Page not found</p>
        <Link
          to="/"
          className="inline-block mt-4"
          style={{ fontSize: 14, color: "hsl(var(--primary))" }}
        >
          ← Back to StratOS
        </Link>

        {/* Mini audit input */}
        <div className="mt-8">
          <p className="mb-3" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            Or start an audit right here:
          </p>
          <div
            className="relative flex items-center mx-auto"
            style={{
              maxWidth: 400,
              height: 48,
              borderRadius: 24,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              paddingLeft: 16,
              paddingRight: 8,
            }}
          >
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your decision..."
              className="w-full bg-transparent outline-none"
              style={{ fontSize: 14, color: "#fff", fontStyle: value ? "normal" : "italic" }}
            />
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-200"
              style={{
                width: 36,
                height: 36,
                background: canSubmit ? "hsl(var(--primary))" : "rgba(201,168,76,0.3)",
                opacity: canSubmit ? 1 : 0.3,
                cursor: canSubmit ? "pointer" : "default",
              }}
            >
              <ArrowRight style={{ width: 16, height: 16, color: "#080808" }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
