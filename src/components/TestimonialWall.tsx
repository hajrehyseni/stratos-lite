import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  { quote: "This replaced the 3-hour board prep I used to dread. The risk surface alone saved us from a bad acquisition.", name: "Sarah Chen", role: "VP Strategy, Series B Fintech" },
  { quote: "StratOS captures 80% of McKinsey's value in 30 seconds. The best pre-meeting prep I've found.", name: "James Wright", role: "Managing Director" },
  { quote: "The stakeholder analysis caught a political blind spot we all missed. We run every major decision through it.", name: "Priya Sharma", role: "COO, HealthTech Scale-up" },
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
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3" style={{ color: "hsl(var(--text-primary))" }}>Trusted by leaders making high-stakes calls</h2>
      <p className="text-center text-base mb-8" style={{ color: "hsl(var(--text-secondary))" }}>From early users</p>
      <div className="relative">
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto scroll-snap-x snap-mandatory px-4 pb-4 scrollbar-hide" style={{ scrollSnapType: "x mandatory" }}>
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card flex-shrink-0 rounded-2xl p-8 transition-all duration-200 snap-start hover:shadow-md" style={{ minWidth: 320, maxWidth: 420, width: "85vw", background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", borderLeft: "3px solid hsl(var(--primary))" }}>
              <div className="mb-4" style={{ color: "hsl(var(--warning))", fontSize: 16, letterSpacing: 2 }}>★★★★★</div>
              <p className="text-base italic leading-relaxed mb-6" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.7 }}>"{t.quote}"</p>
              <div style={{ height: 1, background: "hsl(var(--border))", marginBottom: 16 }} />
              <p className="font-semibold text-base" style={{ color: "hsl(var(--text-primary))" }}>{t.name}</p>
              <p className="text-sm mt-0.5" style={{ color: "hsl(var(--text-secondary))" }}>{t.role}</p>
            </div>
          ))}
        </div>
        <button onClick={() => scroll(-1)} className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 items-center justify-center rounded-full w-10 h-10 transition-all duration-200 hover:scale-[1.05]" style={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(var(--border))", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} aria-label="Previous">
          <ChevronLeft className="w-5 h-5" style={{ color: "hsl(var(--text-primary))" }} />
        </button>
        <button onClick={() => scroll(1)} className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 items-center justify-center rounded-full w-10 h-10 transition-all duration-200 hover:scale-[1.05]" style={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(var(--border))", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} aria-label="Next">
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
