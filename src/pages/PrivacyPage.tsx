import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <NavBar />
      <div className="min-h-screen px-4 pt-24 pb-16 page-enter">
        <div className="mx-auto" style={{ maxWidth: 720 }}>
          <h1 className="text-3xl font-bold mb-8" style={{ color: "hsl(var(--text-primary))" }}>
            Privacy Policy
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "hsl(var(--text-secondary))" }}>
            This page is being finalised. For questions, email hello@stratos.ai
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
