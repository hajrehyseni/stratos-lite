import { useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  { q: "Is my decision data private?", a: "Encrypted, never shared, never used for training." },
  { q: "How is this different from asking ChatGPT?", a: "Structured scorecard with confidence score, risk register, and stakeholder map — not a wall of text." },
  { q: "Is this free?", a: "First audit free, no account needed. Pro is £19/mo." },
];

export function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="py-16 md:py-24 px-4">
      <h2 className="font-serif text-2xl sm:text-3xl text-center mb-12" style={{ color: "hsl(var(--text-primary))" }}>Questions leaders ask</h2>
      <div className="mx-auto" style={{ maxWidth: 768 }}>
        {faqs.map((faq, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={i} style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <button onClick={() => setOpenIdx(isOpen ? null : i)} className="w-full flex items-center justify-between py-5 text-left transition-colors" style={{ background: "none", border: "none", minHeight: 56 }}>
                <span className="text-lg font-semibold pr-4" style={{ color: isOpen ? "hsl(var(--primary))" : "hsl(var(--text-primary))" }}>{faq.q}</span>
                <span className="flex-shrink-0 transition-transform duration-300" style={{ color: isOpen ? "hsl(var(--primary))" : "hsl(var(--text-primary))", transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}><Plus className="w-5 h-5" /></span>
              </button>
              <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: isOpen ? 500 : 0, opacity: isOpen ? 1 : 0 }}>
                <p className="pb-6 text-base leading-relaxed" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.7 }}>{faq.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
