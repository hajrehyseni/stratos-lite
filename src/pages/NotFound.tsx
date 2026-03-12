import { Link, useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ArrowRight } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  const handleStartAudit = () => {
    navigate("/");
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>("#hero-input")
        || document.querySelector<HTMLInputElement>("#hero-input-mobile");
      if (input) {
        input.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => input.focus(), 400);
      }
    }, 300);
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex items-center justify-center text-center px-4 page-enter">
        <div style={{ maxWidth: 480 }}>
          <span className="text-7xl font-bold" style={{ color: "hsl(228, 35%, 30%)" }}>404</span>
          <p className="mt-4 text-lg" style={{ color: "#6B7280" }}>This page doesn't exist</p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "hsl(16, 100%, 62%)", color: "#FFFFFF" }}
            >
              Go home
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleStartAudit}
              className="text-sm transition-opacity hover:opacity-80"
              style={{ color: "hsl(16, 100%, 62%)", background: "none", border: "none" }}
            >
              Or start an audit
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotFound;
