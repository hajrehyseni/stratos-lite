import { useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  { q: "Is my decision data private?", a: "Your data is encrypted and stored securely. We take privacy seriously — your strategic decisions are never shared or used for training." },
  { q: "How is this different from asking ChatGPT?", a: "ChatGPT gives you a wall of text. StratOS gives you a structured scorecard — confidence score, risk register, stakeholder map, and actionable recommendations — all built on the same frameworks McKinsey and BCG use for client engagements." },
  { q: "Who is this built for?", a: "Executives, founders, VPs, and senior leaders who face high-stakes decisions regularly. If you've ever lost sleep over a strategic call — whether to acquire, restructure, pivot, hire, or invest — StratOS is your pre-decision sanity check." },
  { q: "What frameworks does StratOS use?", a: "Six proven strategic frameworks: MECE for decision decomposition, Risk Matrix for threat assessment, Stakeholder Analysis for political mapping, Cynefin for decision classification, Pre-Mortem for failure anticipation, and RAPID for role clarity." },
  { q: "Is this free?", a: "Your first audit is completely free — no account, no credit card, no catch. Free accounts get 3 audits total. Pro (£19/mo) gives you 25 audits, decision journaling, a dashboard, and PDF exports." },
  { q: "Can I trust an AI to help with strategic decisions?", a: "StratOS doesn't make decisions for you — it structures your thinking. The same way a McKinsey engagement doesn't tell a CEO what to do, it ensures they've examined every angle." },
];

export function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="py-16 md:py-24 px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12" style={{ color: "hsl(var(--text-primary))" }}>Questions leaders ask</h2>
      <div className="mx-auto" style={{ maxWidth: 768 }}>
        {faqs.map((faq, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={i} style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <button onClick={() => setOpenIdx(isOpen ? null : i)} className="w-full flex items-center justify-between py-5 text-left transition-colors" style={{ background: "none", border: "none", minHeight: 56 }}>
                <span className="text-lg font-semibold pr-4" style={{ color: isOpen ? "hsl(var(--primary))" : "hsl(var(--text-primary))" }}>{faq.q}</span>
                <span className="flex-shrink-0 transition-transform duration-300" style={{ color: isOpen ? "hsl(var(--primary))" : "hsl(var(--text-primary))", transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}><Plus className="w-5 h-5" /></span>
              </button>
              <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: isOpen ? 400 : 0, opacity: isOpen ? 1 : 0 }}>
                <p className="pb-6 text-base leading-relaxed" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.7 }}>{faq.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
