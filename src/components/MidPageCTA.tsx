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
        className="rounded-2xl mx-auto p-8 md:p-12 flex flex-col md:flex-row md:justify-between md:items-center gap-6"
        style={{
          maxWidth: 1024,
          background: "linear-gradient(to right, rgba(201,168,76,0.05), rgba(201,168,76,0.1), rgba(201,168,76,0.05))",
          border: "1px solid rgba(201,168,76,0.2)",
        }}
      >
        <h3
          className="text-xl font-semibold text-center md:text-left"
          style={{ color: "hsl(var(--foreground))" }}
        >
          Try all 6 strategic frameworks — free
        </h3>
        <div className="flex flex-col items-center md:items-end gap-1.5 flex-shrink-0">
          <button
            onClick={handleClick}
            className="w-full md:w-auto rounded-full px-6 py-3 text-sm font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            }}
          >
            Run Your First Audit →
          </button>
          <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            No account needed
          </span>
        </div>
      </div>
    </div>
  );
}
