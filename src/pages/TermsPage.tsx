import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

const sections = [
  { title: "Service description", body: "StratOS is an AI-powered decision audit tool that applies strategic frameworks to help you evaluate high-stakes decisions. StratOS is a thinking tool — it does not replace professional legal, medical, financial, or investment advice." },
  { title: "Account terms", body: "You are responsible for maintaining the security of your account credentials. You must provide a valid email address. We reserve the right to suspend accounts that violate these terms." },
  { title: "Acceptable use", body: "StratOS is designed for business and strategic decision-making. You may not use the service for decisions that require licensed professional advice. You may not attempt to reverse-engineer the service." },
  { title: "Payment terms", body: "Paid subscriptions are billed monthly through Stripe. You can cancel at any time. We offer a 30-day money-back guarantee on all paid plans." },
  { title: "Limitation of liability", body: "StratOS provides AI-generated strategic analysis as a decision support tool. All decisions remain your responsibility. We make no guarantees about the accuracy or completeness of AI-generated content." },
  { title: "Changes to terms", body: "We may update these terms from time to time. When we make significant changes, we will notify you by email at least 14 days before the changes take effect." },
];

export default function TermsPage() {
  return (
    <>
      <NavBar />
      <div className="min-h-screen px-4 pt-28 pb-20 page-enter" style={{ background: "hsl(var(--background))" }}>
        <div className="mx-auto" style={{ maxWidth: 720 }}>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2" style={{ color: "hsl(var(--text-primary))" }}>Terms of Service</h1>
          <p className="text-sm mb-12" style={{ color: "hsl(var(--text-tertiary))" }}>Last updated: December 2026</p>
          <div className="space-y-10">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="text-xl font-semibold mb-3" style={{ color: "hsl(var(--text-primary))" }}>{s.title}</h2>
                <p className="text-base leading-relaxed" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.7 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
