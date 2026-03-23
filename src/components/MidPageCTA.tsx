export function MidPageCTA() {
  const handleClick = () => {
    const input = document.querySelector<HTMLInputElement>("#hero-input") || document.querySelector<HTMLInputElement>("#hero-input-mobile");
    if (input) { input.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => input.focus(), 400); }
  };

  return (
    <div className="px-4 sm:px-6 py-16 md:py-24">
      <div className="rounded-2xl mx-auto p-10 md:p-14 text-center" style={{ maxWidth: 672, background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
        <h3 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: "hsl(var(--text-primary))" }}>Your next decision, sorted.</h3>
        <button onClick={handleClick} className="rounded-full px-12 py-5 text-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", minHeight: 56 }}>
          Start free audit →
        </button>
      </div>
    </div>
  );
}
