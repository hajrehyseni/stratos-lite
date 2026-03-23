import { useState, useEffect } from "react";

const testimonials = [
  { quote: "Replaced 3 hours of board prep. The risk surface alone saved us from a bad acquisition.", name: "Sarah Chen", role: "VP Strategy, Series B Fintech" },
  { quote: "80% of McKinsey's value in 30 seconds. Best pre-meeting prep I've found.", name: "James Wright", role: "Managing Director" },
  { quote: "Caught a political blind spot we all missed. We run every major decision through it.", name: "Priya Sharma", role: "COO, HealthTech Scale-up" },
];

export function TestimonialWall() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setActiveIdx(p => (p + 1) % testimonials.length);
        setFade(true);
      }, 300);
    }, 6000);
    return () => clearInterval(iv);
  }, []);

  const t = testimonials[activeIdx];

  return (
    <div className="py-16 md:py-24 px-4">
      <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-12" style={{ color: "hsl(var(--text-primary))", letterSpacing: "-0.03em" }}>What leaders say</h2>
      <div className="mx-auto text-center" style={{ maxWidth: 640 }}>
        <div style={{ transition: "opacity 300ms ease", opacity: fade ? 1 : 0 }}>
          <p className="text-xl sm:text-2xl leading-relaxed mb-6" style={{ color: "hsl(var(--text-primary))", lineHeight: 1.6 }}>
            "{t.quote}"
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="rounded-full flex items-center justify-center text-sm font-semibold" style={{ width: 40, height: 40, background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", flexShrink: 0 }}>
              {t.name.charAt(0)}
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm" style={{ color: "hsl(var(--text-primary))" }}>{t.name}</p>
              <p className="text-xs" style={{ color: "hsl(var(--text-tertiary))" }}>{t.role}</p>
            </div>
          </div>
        </div>
        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => { setFade(false); setTimeout(() => { setActiveIdx(i); setFade(true); }, 200); }} className="rounded-full transition-all duration-200" aria-label={`Testimonial ${i + 1}`} style={{ width: activeIdx === i ? 20 : 8, height: 8, background: activeIdx === i ? "hsl(var(--text-primary))" : "hsl(var(--border))" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
