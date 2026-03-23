import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  { quote: "Replaced 3 hours of board prep. The risk surface alone saved us from a bad acquisition.", name: "Sarah Chen", role: "VP Strategy, Series B Fintech" },
  { quote: "80% of McKinsey's value in 30 seconds. Best pre-meeting prep I've found.", name: "James Wright", role: "Managing Director" },
  { quote: "Caught a political blind spot we all missed. We run every major decision through it.", name: "Priya Sharma", role: "COO, HealthTech Scale-up" },
];

export function TestimonialWall() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const scrollTo = useCallback((idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".testimonial-card");
    if (!card) return;
    el.scrollTo({ left: idx * (card.offsetWidth + 24), behavior: "smooth" });
  }, []);

  const scroll = useCallback((dir: number) => {
    const next = activeIdx + dir;
    const idx = next < 0 ? testimonials.length - 1 : next >= testimonials.length ? 0 : next;
    scrollTo(idx);
    setActiveIdx(idx);
  }, [activeIdx, scrollTo]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const h = () => { const card = el.querySelector<HTMLElement>(".testimonial-card"); if (!card) return; setActiveIdx(Math.min(Math.round(el.scrollLeft / (card.offsetWidth + 24)), testimonials.length - 1)); };
    el.addEventListener("scroll", h, { passive: true });
    return () => el.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    if (paused) return;
    const iv = setInterval(() => scroll(1), 5000);
    return () => clearInterval(iv);
  }, [scroll, paused]);

  return (
    <div className="py-16 md:py-20" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8" style={{ color: "hsl(var(--text-primary))" }}>What leaders say</h2>
      <div className="relative px-4 sm:px-8" style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto scroll-snap-x snap-mandatory pb-4 scrollbar-hide" style={{ scrollSnapType: "x mandatory" }}>
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card flex-shrink-0 rounded-2xl p-8 transition-all duration-200 snap-start hover:shadow-md relative" style={{ minWidth: 320, maxWidth: 420, width: "85vw", background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", borderLeft: "3px solid hsl(var(--primary))" }}>
              <span className="absolute top-4 left-6 text-4xl font-serif select-none" style={{ color: "hsla(221, 83%, 53%, 0.08)", lineHeight: 1 }}>"</span>
              <div className="mb-4" style={{ color: "hsl(var(--warning))", fontSize: 16, letterSpacing: 2 }}>★★★★★</div>
              <p className="text-base italic leading-relaxed mb-6" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.7 }}>"{t.quote}"</p>
              <div style={{ height: 1, background: "hsl(var(--border))", marginBottom: 16 }} />
              <div className="flex items-center gap-3">
                <div className="rounded-full flex items-center justify-center text-sm font-bold" style={{ width: 36, height: 36, background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", flexShrink: 0 }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "hsl(var(--text-primary))" }}>{t.name}</p>
                  <p className="text-xs" style={{ color: "hsl(var(--text-tertiary))" }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Left arrow */}
        <button
          onClick={() => scroll(-1)}
          className="hidden md:flex absolute items-center justify-center rounded-full w-10 h-10 transition-all duration-200 hover:scale-[1.05] hover:shadow-lg"
          style={{ left: -4, top: "50%", transform: "translateY(-50%)", background: "hsl(0, 0%, 100%)", border: "1px solid hsl(var(--border))", boxShadow: "0 2px 8px hsla(0, 0%, 0%, 0.1)", zIndex: 10 }}
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" style={{ color: "hsl(var(--text-primary))" }} />
        </button>
        {/* Right arrow */}
        <button
          onClick={() => scroll(1)}
          className="hidden md:flex absolute items-center justify-center rounded-full w-10 h-10 transition-all duration-200 hover:scale-[1.05] hover:shadow-lg"
          style={{ right: -4, top: "50%", transform: "translateY(-50%)", background: "hsl(0, 0%, 100%)", border: "1px solid hsl(var(--border))", boxShadow: "0 2px 8px hsla(0, 0%, 0%, 0.1)", zIndex: 10 }}
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" style={{ color: "hsl(var(--text-primary))" }} />
        </button>
      </div>
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, i) => (
          <button key={i} onClick={() => { scrollTo(i); setActiveIdx(i); }} className="rounded-full transition-all duration-200" aria-label={`Go to testimonial ${i + 1}`} style={{ width: activeIdx === i ? 20 : 8, height: 8, background: activeIdx === i ? "hsl(var(--primary))" : "hsl(var(--border))" }} />
        ))}
      </div>
    </div>
  );
}
