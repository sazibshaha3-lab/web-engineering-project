import { Link } from "react-router-dom";
import Button from "../common/Button";
import ErrorState from "../common/ErrorState";

export default function OrderLookupState({ loading, error, onRetry, backTo, backLabel = "Back to Orders" }) {
  if (loading) {
    return (
      <div className="fade-in" role="status" aria-live="polite" style={{ padding: "var(--space-12) 0", textAlign: "center" }}>
        Loading order…
      </div>
    );
  }

  return (
    <ErrorState
      title="Couldn't load this order"
      description={error || "Please check your connection and try again."}
      onRetry={onRetry}
      actionLabel="Try again"
      secondaryAction={(
        <Button as={Link} to={backTo} variant="ghost" size="sm">
          {backLabel}
        </Button>
      )}
    />
  );
}
