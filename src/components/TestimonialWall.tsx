import { useRef, useState, useEffect } from "react";
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

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

export function TestimonialWall() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scroll = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>(".testimonial-card")?.offsetWidth || 400;
    el.scrollBy({ left: dir * (cardWidth + 24), behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const cardWidth = el.querySelector<HTMLElement>(".testimonial-card")?.offsetWidth || 400;
      const idx = Math.round(el.scrollLeft / (cardWidth + 24));
      setActiveIdx(Math.min(idx, testimonials.length - 1));
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => scroll(1), 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <div className="py-12 md:py-20">
      <h2
        className="text-2xl md:text-3xl font-semibold text-center mb-3"
        style={{ color: "#FFFFFF" }}
      >
        Trusted by leaders making high-stakes calls
      </h2>
      <p className="text-center text-sm mb-4" style={{ color: "#6B7280" }}>
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
                maxWidth: 400,
                width: "85vw",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderLeft: "2px solid hsl(16, 100%, 62%)",
              }}
            >
              <div className="mb-4" style={{ color: "hsl(38, 92%, 50%)", fontSize: 14, letterSpacing: 2 }}>
                ★★★★★
              </div>
              <p className="text-base italic leading-relaxed mb-6" style={{ color: "#9CA3AF", lineHeight: 1.6 }}>
                "{truncate(t.quote, 120)}"
              </p>
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 16 }} />
              <p className="font-semibold text-sm" style={{ color: "#FFFFFF" }}>{t.name}</p>
              <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>{t.role}</p>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={() => scroll(-1)}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 items-center justify-center rounded-full w-10 h-10 transition-all duration-200 hover:scale-[1.05]"
          style={{ background: "hsla(228, 35%, 16%, 0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-5 h-5" style={{ color: "#FFFFFF" }} />
        </button>
        <button
          onClick={() => scroll(1)}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 items-center justify-center rounded-full w-10 h-10 transition-all duration-200 hover:scale-[1.05]"
          style={{ background: "hsla(228, 35%, 16%, 0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-5 h-5" style={{ color: "#FFFFFF" }} />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-200"
            style={{
              width: activeIdx === i ? 16 : 6,
              height: 6,
              background: activeIdx === i ? "hsl(16, 100%, 62%)" : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
