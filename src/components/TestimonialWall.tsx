import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* <!-- PLACEHOLDER TESTIMONIALS — From early users --> */
const testimonials = [
  {
    quote: "This replaced the 3-hour board prep I used to dread. The risk surface alone saved us from a bad acquisition.",
    name: "Sarah Chen",
    role: "VP Strategy, Series B Fintech",
  },
  {
    quote: "StratOS captures 80% of McKinsey's value in 30 seconds. The best pre-meeting prep I've found.",
    name: "James Wright",
    role: "Managing Director",
  },
  {
    quote: "The stakeholder analysis caught a political blind spot we all missed. We run every major decision through it.",
    name: "Priya Sharma",
    role: "COO, HealthTech Scale-up",
  },
];

export function TestimonialWall() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollTo = useCallback((idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".testimonial-card");
    if (!card) return;
    const cardWidth = card.offsetWidth + 24; // gap
    el.scrollTo({ left: idx * cardWidth, behavior: "smooth" });
  }, []);

  const scroll = useCallback((dir: number) => {
    const nextIdx = activeIdx + dir;
    if (nextIdx < 0) {
      scrollTo(testimonials.length - 1);
      setActiveIdx(testimonials.length - 1);
    } else if (nextIdx >= testimonials.length) {
      scrollTo(0);
      setActiveIdx(0);
    } else {
      scrollTo(nextIdx);
      setActiveIdx(nextIdx);
    }
  }, [activeIdx, scrollTo]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const card = el.querySelector<HTMLElement>(".testimonial-card");
      if (!card) return;
      const cardWidth = card.offsetWidth + 24;
      const idx = Math.round(el.scrollLeft / cardWidth);
      setActiveIdx(Math.min(idx, testimonials.length - 1));
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll every 5 seconds with wrap
  useEffect(() => {
    intervalRef.current = setInterval(() => scroll(1), 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [scroll]);

  return (
    <div className="py-16 md:py-24">
      <h2
        className="text-2xl sm:text-3xl font-bold text-center mb-3"
        style={{ color: "hsl(var(--text-primary))" }}
      >
        Trusted by leaders making high-stakes calls
      </h2>
      <p className="text-center text-base mb-8" style={{ color: "hsl(var(--text-secondary))" }}>
        From early users
      </p>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-snap-x snap-mandatory px-4 pb-4 scrollbar-hide"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="testimonial-card flex-shrink-0 rounded-2xl p-8 transition-colors duration-200 snap-start"
              style={{
                minWidth: 320,
                maxWidth: 420,
                width: "85vw",
                background: "hsla(0, 0%, 100%, 0.04)",
                border: "1px solid hsla(0, 0%, 100%, 0.08)",
                borderLeft: "3px solid hsl(var(--primary))",
              }}
            >
              <div className="mb-4" style={{ color: "hsl(var(--warning))", fontSize: 16, letterSpacing: 2 }}>
                ★★★★★
              </div>
              <p className="text-base italic leading-relaxed mb-6" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.7 }}>
                "{t.quote}"
              </p>
              <div style={{ height: 1, background: "hsla(0, 0%, 100%, 0.06)", marginBottom: 16 }} />
              <p className="font-semibold text-base" style={{ color: "hsl(var(--text-primary))" }}>{t.name}</p>
              <p className="text-sm mt-0.5" style={{ color: "hsl(var(--text-secondary))" }}>{t.role}</p>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={() => scroll(-1)}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 items-center justify-center rounded-full w-10 h-10 transition-all duration-200 hover:scale-[1.05]"
          style={{ background: "hsla(228, 35%, 16%, 0.9)", border: "1px solid hsla(0, 0%, 100%, 0.1)" }}
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-5 h-5" style={{ color: "hsl(var(--text-primary))" }} />
        </button>
        <button
          onClick={() => scroll(1)}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 items-center justify-center rounded-full w-10 h-10 transition-all duration-200 hover:scale-[1.05]"
          style={{ background: "hsla(228, 35%, 16%, 0.9)", border: "1px solid hsla(0, 0%, 100%, 0.1)" }}
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-5 h-5" style={{ color: "hsl(var(--text-primary))" }} />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => { scrollTo(i); setActiveIdx(i); }}
            className="rounded-full transition-all duration-200"
            aria-label={`Go to testimonial ${i + 1}`}
            style={{
              width: activeIdx === i ? 20 : 8,
              height: 8,
              background: activeIdx === i ? "hsl(var(--primary))" : "hsla(0, 0%, 100%, 0.15)",
              minHeight: 8,
            }}
          />
        ))}
      </div>
    </div>
  );
}
