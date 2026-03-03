import { useState } from "react";
import { Loader2 } from "lucide-react";

interface DecisionInputProps {
  onSubmit: (decision: string) => void;
  isLoading: boolean;
}

export function DecisionInput({ onSubmit, isLoading }: DecisionInputProps) {
  const [decision, setDecision] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (decision.trim() && !isLoading) {
      onSubmit(decision.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Brand */}
        <div className="text-center space-y-3">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-body">
            London Royal Academy
          </p>
          <h2 className="text-sm font-medium tracking-wide text-gold">
            StratOS Lite
          </h2>
        </div>

        {/* Headline */}
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-center leading-tight text-foreground">
          What's the most important business decision you're facing right now?
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="Should we expand into the UAE market next year?"
            className="w-full h-32 sm:h-36 bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground font-body text-base resize-none focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-colors"
            disabled={isLoading}
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!decision.trim() || isLoading}
            className="w-full bg-gold text-accent-foreground font-body font-semibold text-base py-3.5 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Auditing…
              </>
            ) : (
              "Audit My Decision"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
