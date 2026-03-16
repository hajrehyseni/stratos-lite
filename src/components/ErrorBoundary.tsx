import React from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <NavBar />
          <div className="min-h-screen flex items-center justify-center px-4 pt-16">
            <div className="text-center" style={{ maxWidth: 480 }}>
              <div
                className="mx-auto mb-6 flex items-center justify-center rounded-full"
                style={{ width: 64, height: 64, background: "hsla(0, 84%, 60%, 0.12)" }}
              >
                <span style={{ fontSize: 28 }}>⚠️</span>
              </div>
              <h1 className="text-2xl font-bold mb-3" style={{ color: "hsl(var(--text-primary))" }}>
                Something went wrong
              </h1>
              <p className="text-lg mb-8" style={{ color: "hsl(var(--text-secondary))" }}>
                An unexpected error occurred. Please try refreshing the page.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-full px-6 py-3 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                    boxShadow: "0 4px 16px hsla(16, 100%, 62%, 0.3)",
                  }}
                >
                  Refresh page
                </button>
                <a
                  href="/"
                  className="rounded-full px-6 py-3 text-base font-medium transition-all hover:scale-[1.02]"
                  style={{
                    border: "1px solid hsla(0, 0%, 100%, 0.2)",
                    color: "hsl(var(--text-primary))",
                  }}
                >
                  Go home
                </a>
              </div>
            </div>
          </div>
          <Footer />
        </>
      );
    }

    return this.props.children;
  }
}
