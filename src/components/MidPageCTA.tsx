import { ArrowRight } from "lucide-react";

export function MidPageCTA() {
  const handleClick = () => {
    const input = document.querySelector<HTMLInputElement>("#hero-input") || document.querySelector<HTMLInputElement>("#hero-input-mobile");
    if (input) { input.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => input.focus(), 400); }
  };

  return (
    <div className="px-4 sm:px-6 py-16 md:py-24 text-center">
      <h3 className="font-serif text-2xl md:text-3xl mb-8" style={{ color: "hsl(var(--text-primary))" }}>Your next decision, sorted.</h3>
      <button onClick={handleClick} className="rounded-full px-10 py-4 text-xl font-semibold inline-flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", minHeight: 56 }}>
        Start free audit <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
