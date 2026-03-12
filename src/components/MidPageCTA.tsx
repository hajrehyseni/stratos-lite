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
    <div className="px-4 sm:px-6 py-16 md:py-24">
      <div
        className="rounded-2xl mx-auto p-10 md:p-14 text-center"
        style={{
          maxWidth: 672,
          background: "hsla(0, 0%, 100%, 0.03)",
          border: "1px solid hsla(0, 0%, 100%, 0.08)",
        }}
      >
        <h3
          className="text-2xl md:text-3xl font-bold mb-4"
          style={{ color: "hsl(var(--text-primary))" }}
        >
          Ready to make a better call?
        </h3>
        <p className="text-base mb-8" style={{ color: "hsl(var(--text-secondary))" }}>
          Your next big decision deserves more than instinct.
        </p>
        <button
          onClick={handleClick}
          className="rounded-full px-10 py-4 text-lg font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            boxShadow: "0 4px 20px hsla(16, 100%, 62%, 0.3)",
            minHeight: 52,
          }}
        >
          Start free audit →
        </button>
        <p className="mt-4 text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>
          No account needed
        </p>
      </div>
    </div>
  );
}
