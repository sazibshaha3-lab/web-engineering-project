import { Link } from "react-router-dom";
import { CompassIcon } from "lucide-react";
import Button from "../../components/common/Button";

export default function NotFound() {
  return (
    <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", textAlign: "center", padding: "var(--space-10)" }}>
      <div>
        <span style={{ display: "inline-grid", placeItems: "center", width: 64, height: 64, borderRadius: "50%", background: "var(--color-primary-tint)", color: "var(--color-primary)", marginBottom: "var(--space-5)" }}>
          <CompassIcon size={28} />
        </span>
        <h1 style={{ font: "var(--text-h1)", fontSize: "2rem", marginBottom: "var(--space-3)" }}>Page not found</h1>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--space-6)" }}>
          The page you're looking for doesn't exist or has moved.
        </p>
        <Button as={Link} to="/">Back to home</Button>
      </div>
    </div>
  );
}
