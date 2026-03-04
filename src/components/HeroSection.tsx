export function HeroSection() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 text-center" style={{ gap: "32px" }}>
      {/* Brand tag */}
      <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-mono">
        London Royal Academy
      </p>

      {/* Headline */}
      <h1
        className="font-headline font-bold text-foreground leading-[1.0] text-center"
        style={{
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          letterSpacing: "-0.02em",
        }}
      >
        THE OPERATING SYSTEM
        <br />
        FOR HOW YOU MAKE
        <br />
        DECISIONS<span className="gold-shimmer">.</span>
      </h1>

      {/* Social proof */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-px bg-gold/30" />
        <p
          className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground"
          style={{ opacity: 0.5 }}
        >
          Built on frameworks used by McKinsey, BCG & Bain
        </p>
      </div>

      {/* Subhead — punchy one-liner */}
      <p
        className="font-manrope text-sm sm:text-base text-muted-foreground max-w-xl"
        style={{ lineHeight: 1.6 }}
      >
        Answer 3 questions. Get the decision audit your board actually needs.
      </p>

      {/* Visual stepper */}
      <div className="flex items-center gap-0 sm:gap-1 max-w-lg w-full justify-center">
        {[
          { num: 1, label: "3 Questions" },
          { num: 2, label: "AI Prompt Built" },
          { num: 3, label: "Executive Audit" },
          { num: 4, label: "Track Outcomes" },
        ].map((item, i) => (
          <div key={i} className="flex items-center">
            {i > 0 && (
              <div className="w-6 sm:w-10 h-px" style={{ backgroundColor: "rgba(255,184,0,0.3)" }} />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-mono font-bold"
                style={{
                  border: "1.5px solid rgba(255,184,0,0.5)",
                  color: "#FFB800",
                  backgroundColor: "rgba(255,184,0,0.06)",
                }}
              >
                {item.num}
              </div>
              <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Privacy — single line footnote */}
      <p className="text-[11px] text-muted-foreground font-manrope flex items-center gap-1.5" style={{ opacity: 0.6 }}>
        🔒 Private by design — nothing stored, logged, or shared. Ever.
      </p>
    </div>
  );
}
