import { Link, useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ArrowRight, Compass } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <>
      <NavBar />
      <div className="min-h-screen flex items-center justify-center text-center px-4 page-enter" style={{ background: "hsl(var(--background))" }}>
        <div style={{ maxWidth: 480 }}>
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="rounded-full flex items-center justify-center" style={{ width: 120, height: 120, background: "hsla(221, 83%, 53%, 0.08)", border: "1px solid hsla(221, 83%, 53%, 0.15)" }}>
              <Compass className="w-14 h-14" style={{ color: "hsl(var(--primary))", opacity: 0.7 }} />
              <span className="absolute text-2xl font-bold" style={{ color: "hsl(var(--primary))", bottom: 20, right: 20 }}>?</span>
            </div>
          </div>
          <span className="text-7xl font-extrabold tracking-tight" style={{ color: "hsl(var(--border))" }}>404</span>
          <p className="mt-4 text-xl font-semibold" style={{ color: "hsl(var(--text-primary))" }}>This decision path doesn't exist</p>
          <p className="mt-2 text-base" style={{ color: "hsl(var(--text-secondary))" }}>The page you're looking for has been moved or never existed.</p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", minHeight: 48 }}>
              Go home <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotFound;
