import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

const sections = [
  {
    title: "What we collect",
    body: "When you create an account, we store your email address and authentication credentials. When you run a decision audit, we store the decision text you enter and the AI-generated analysis so you can access it later. We also collect basic usage data such as audit counts to manage your plan limits.",
  },
  {
    title: "How we use it",
    body: "Your data is used solely to provide the StratOS service — generating decision audits, saving them to your journal, and displaying your dashboard analytics. We do not sell, rent, or share your personal data with advertisers or data brokers. We do not use your decision text to train AI models.",
  },
  {
    title: "Data storage",
    body: "All data is encrypted in transit (TLS 1.2+) and at rest. Our infrastructure is hosted on secure, SOC 2-compliant cloud servers. Database backups are encrypted and stored in geographically redundant locations.",
  },
  {
    title: "Third parties",
    body: "We use Stripe to process payments — they receive your payment details but not your decision data. We use an AI model provider to generate audit analyses — your decision text is sent to them for processing but is not stored or used for training by the provider. We do not share your data with any other third parties.",
  },
  {
    title: "Your rights",
    body: "You can delete your account and all associated data at any time by contacting us. You can request an export of your audit history. Under GDPR, you have the right to access, rectify, or erase your personal data. We will respond to all data requests within 30 days.",
  },
  {
    title: "Contact",
    body: "For any privacy-related questions or data requests, email us at hello@stratos.ai. We take your privacy seriously and will respond within 48 hours.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <NavBar />
      <div className="min-h-screen px-4 pt-28 pb-20 page-enter">
        <div className="mx-auto" style={{ maxWidth: 720 }}>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2" style={{ color: "hsl(var(--text-primary))" }}>
            Privacy Policy
          </h1>
          <p className="text-sm mb-12" style={{ color: "hsl(var(--text-tertiary))" }}>
            Last updated: December 2026
          </p>

          <div className="space-y-10">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="text-xl font-semibold mb-3" style={{ color: "hsl(var(--text-primary))" }}>
                  {s.title}
                </h2>
                <p className="text-base leading-relaxed" style={{ color: "hsl(var(--text-secondary))", lineHeight: 1.7 }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
