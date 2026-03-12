import { useNavigate, useLocation } from "react-router-dom";

export function MidPageCTA() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (location.pathname === "/") {
      const input = document.querySelector<HTMLInputElement>("#hero-input");
      if (input) {
        input.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => input.focus(), 400);
      }
    } else {
      navigate("/");
    }
  };

  return (
    <div className="px-4 sm:px-6">
      <div
        className="rounded-2xl mx-auto p-8 md:p-12 text-center"
        style={{
          maxWidth: 672,
          background: "linear-gradient(to right, rgba(201,168,76,0.05), rgba(201,168,76,0.1), rgba(201,168,76,0.05))",
          border: "1px solid rgba(201,168,76,0.2)",
        }}
      >
        <h3
          className="text-xl font-semibold mb-6"
          style={{ color: "hsl(var(--foreground))" }}
        >
          Ready to audit your next big call?
        </h3>
        <button
          onClick={handleClick}
          className="rounded-full px-8 py-4 text-lg font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            boxShadow: "0 0 20px rgba(201,168,76,0.3)",
          }}
        >
          Run Your First Audit →
        </button>
        <p className="mt-3 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
          No account needed
        </p>
      </div>
    </div>
  );
}
