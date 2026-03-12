import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* <!-- PLACEHOLDER TESTIMONIALS --> */
const testimonials = [
  {
    quote: "This replaced the 3-hour board prep I used to dread. The risk surface alone saved us from a bad acquisition.",
    name: "Sarah Chen",
    role: "VP Strategy, Series B Fintech",
  },
  {
    quote: "I've used McKinsey frameworks for 20 years. StratOS captures 80% of that value in 30 seconds. Not a replacement for consultants — but the best pre-meeting prep I've found.",
    name: "James Wright",
    role: "Managing Director",
  },
  {
    quote: "We run every major decision through StratOS now. The stakeholder analysis caught a political blind spot we all missed.",
    name: "Priya Sharma",
    role: "COO, HealthTech Scale-up",
  },
  {
    quote: "Finally, an AI tool that doesn't just summarise — it actually challenges your thinking with the devil's advocate.",
    name: "Michael Torres",
    role: "Founder & CEO",
  },
  {
    quote: "The confidence score gave me the language to tell the board 'not yet' on a deal everyone was excited about. Three months later we found a better target.",
    name: "Rebecca Liu",
    role: "CFO",
  },
  {
    quote: "I was sceptical of AI strategy tools. Then I ran our market expansion decision through StratOS and it flagged an assumption I'd missed in 6 months of analysis.",
    name: "Daniel Okafor",
    role: "VP Operations",
  },
];

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

  // Auto-scroll
  useEffect(() => {
    intervalRef.current = setInterval(() => scroll(1), 6000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <div className="py-20 md:py-28">
      <h2
        className="text-3xl font-semibold text-center mb-3"
        style={{ color: "hsl(var(--foreground))" }}
      >
        Trusted by leaders making high-stakes calls
      </h2>
      <p className="text-center mb-12" style={{ color: "hsl(var(--muted-foreground))" }}>
        Join 2,400+ executives who audit before they act
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
                background: "#0F0F0F",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              <div className="mb-4" style={{ color: "hsl(var(--primary))", fontSize: 16, letterSpacing: 2 }}>
                ★★★★★
              </div>
              <p className="text-lg italic leading-relaxed mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
                "{t.quote}"
              </p>
              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 16 }} />
              <p className="font-semibold text-sm" style={{ color: "hsl(var(--foreground))" }}>{t.name}</p>
              <p className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{t.role}</p>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={() => scroll(-1)}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 items-center justify-center rounded-full w-10 h-10 transition-all duration-150 hover:scale-[1.05]"
          style={{ background: "rgba(15,15,15,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <ChevronLeft className="w-5 h-5" style={{ color: "hsl(var(--foreground))" }} />
        </button>
        <button
          onClick={() => scroll(1)}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 items-center justify-center rounded-full w-10 h-10 transition-all duration-150 hover:scale-[1.05]"
          style={{ background: "rgba(15,15,15,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <ChevronRight className="w-5 h-5" style={{ color: "hsl(var(--foreground))" }} />
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
              background: activeIdx === i ? "hsl(var(--primary))" : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
