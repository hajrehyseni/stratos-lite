import { Link } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ArrowRight, MessageSquare, Target, Share2 } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Describe a real decision you're facing",
    description: "Paste the decision exactly as you'd explain it to a trusted advisor.",
  },
  {
    icon: Target,
    title: "Add stakes and context for better accuracy",
    description: "Our diagnostic asks 3 quick questions to calibrate all 6 frameworks to your situation.",
  },
  {
    icon: Share2,
    title: "Review your scorecard and share with your team",
    description: "Get a confidence score, risk matrix, stakeholder map, and actionable next steps.",
  },
];

export default function WelcomePage() {
  return (
    <>
      <NavBar />
      <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-20 page-enter">
        <div className="w-full text-center" style={{ maxWidth: 680 }}>
          <h1
            className="text-3xl sm:text-4xl font-extrabold mb-3"
            style={{ color: "hsl(var(--text-primary))" }}
          >
            Welcome to StratOS 👋
          </h1>
          <p className="text-lg mb-12" style={{ color: "hsl(var(--text-secondary))" }}>
            You have <strong style={{ color: "hsl(var(--primary))" }}>3 free strategic audits</strong>. Here's how to make the most of them:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="rounded-2xl p-6 text-left"
                style={{
                  background: "hsla(0, 0%, 100%, 0.04)",
                  border: "1px solid hsla(0, 0%, 100%, 0.08)",
                }}
              >
                <div
                  className="flex items-center justify-center rounded-xl mb-4"
                  style={{
                    width: 48,
                    height: 48,
                    background: "hsla(16, 100%, 62%, 0.12)",
                  }}
                >
                  <step.icon className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "hsl(var(--text-tertiary))" }}>
                  Step {i + 1}
                </p>
                <h3 className="text-base font-semibold mb-2" style={{ color: "hsl(var(--text-primary))" }}>
                  {step.title}
                </h3>
                <p className="text-sm" style={{ color: "hsl(var(--text-secondary))" }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              boxShadow: "0 4px 20px hsla(16, 100%, 62%, 0.3)",
            }}
          >
            Run your first audit
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="mt-6">
            <Link
              to="/pricing"
              className="text-base transition-opacity hover:opacity-80"
              style={{ color: "hsl(var(--text-secondary))" }}
            >
              Explore pricing →
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
