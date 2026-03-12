export function MidPageCTA() {
  const handleClick = () => {
    const input = document.querySelector<HTMLInputElement>("#hero-input") 
      || document.querySelector<HTMLInputElement>("#hero-input-mobile");
    if (input) {
      input.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => input.focus(), 400);
    }
  };

  return (
    <div className="px-4 sm:px-6 py-12 md:py-20">
      <div
        className="rounded-2xl mx-auto p-8 md:p-12 text-center"
        style={{
          maxWidth: 672,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h3
          className="text-xl md:text-2xl font-semibold mb-6"
          style={{ color: "#FFFFFF" }}
        >
          Ready to audit your next big call?
        </h3>
        <button
          onClick={handleClick}
          className="rounded-full px-8 py-4 text-lg font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "hsl(16, 100%, 62%)",
            color: "#FFFFFF",
            boxShadow: "0 0 20px hsla(16, 100%, 62%, 0.3)",
          }}
        >
          Start your free audit ↑
        </button>
        <p className="mt-3 text-xs" style={{ color: "#6B7280" }}>
          No account needed
        </p>
      </div>
    </div>
  );
}
