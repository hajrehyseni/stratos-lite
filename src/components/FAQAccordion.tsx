import { useState } from "react";
import { Plus, X } from "lucide-react";

const faqs = [
  {
    q: "Is my decision data private?",
    a: "Completely. Your data stays in your browser session. We don't store decisions on any server — ever. When you close the tab, the analysis is gone unless you save it to your journal.",
  },
  {
    q: "How is this different from asking ChatGPT?",
    a: "ChatGPT gives you a wall of text. StratOS gives you a structured scorecard — confidence score, risk register, stakeholder map, and actionable recommendations — all built on the same frameworks McKinsey and BCG use for client engagements. It's the difference between an essay and a strategic brief.",
  },
  {
    q: "Who is this built for?",
    a: "Executives, founders, VPs, and senior leaders who face high-stakes decisions regularly. If you've ever lost sleep over a strategic call — whether to acquire, restructure, pivot, hire, or invest — StratOS is your pre-decision sanity check.",
  },
  {
    q: "What frameworks does StratOS use?",
    a: "Six proven strategic frameworks: MECE for decision decomposition, Risk Matrix for threat assessment, Stakeholder Analysis for political mapping, Cynefin for decision classification, Pre-Mortem for failure anticipation, and RAPID for role clarity. Each audit applies the frameworks most relevant to your decision type.",
  },
  {
    q: "Is this free?",
    a: "Your first audit is completely free — no account, no credit card, no catch. Free accounts get 3 audits total. Pro (£19/mo) gives you 25 audits, decision journaling, a dashboard, and PDF exports. Executive (£49/mo) gives you 120 audits with priority processing.",
  },
  {
    q: "Can I trust an AI to help with strategic decisions?",
    a: "StratOS doesn't make decisions for you — it structures your thinking. The same way a McKinsey engagement doesn't tell a CEO what to do, it ensures they've examined every angle. StratOS is a forcing function for rigorous thinking, not an oracle.",
  },
];

export function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="py-12 md:py-20 px-4">
      <h2
        className="text-2xl md:text-3xl font-semibold text-center mb-12"
        style={{ color: "#FFFFFF" }}
      >
        Questions leaders ask
      </h2>
      <div className="mx-auto" style={{ maxWidth: 768 }}>
        {faqs.map((faq, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left transition-colors"
                style={{ background: "none", border: "none", minHeight: 44 }}
              >
                <span
                  className="text-base font-medium pr-4"
                  style={{ color: isOpen ? "hsl(16, 100%, 62%)" : "#FFFFFF" }}
                >
                  {faq.q}
                </span>
                <span className="flex-shrink-0 transition-transform duration-300" style={{ color: isOpen ? "hsl(16, 100%, 62%)" : "#FFFFFF", transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}>
                  <Plus className="w-4 h-4" />
                </span>
              </button>
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: isOpen ? 300 : 0,
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <p
                  className="pb-5 text-base leading-relaxed"
                  style={{ color: "#6B7280", lineHeight: 1.6 }}
                >
                  {faq.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
