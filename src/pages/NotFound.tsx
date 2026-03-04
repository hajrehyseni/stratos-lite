import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <span style={{ fontSize: 64, fontWeight: 700, color: "#FFB800", lineHeight: 1 }}>404</span>
        <p className="mt-4" style={{ fontSize: 16, color: "rgba(255,255,255,0.6)" }}>Page not found</p>
        <Link
          to="/"
          className="inline-block mt-4"
          style={{ fontSize: 14, color: "#FFB800" }}
        >
          ← Back to StratOS
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
