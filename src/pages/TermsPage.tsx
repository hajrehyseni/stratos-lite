import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <>
      <NavBar />
      <div className="min-h-screen px-4 pt-24 pb-16">
        <div className="mx-auto" style={{ maxWidth: 720 }}>
          <h1 className="text-3xl font-semibold mb-8" style={{ color: "hsl(var(--foreground))" }}>
            Terms of Service
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
            This page is being finalised. For questions, email hello@stratos.ai
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
