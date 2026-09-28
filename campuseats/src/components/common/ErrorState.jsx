import { AlertTriangle, RotateCcw } from "lucide-react";
import Button from "./Button";
import "./ErrorState.css";

export default function ErrorState({
  icon: Icon = AlertTriangle,
  title = "Something went wrong",
  description = "That didn't load correctly. Check your connection and try again.",
  onRetry,
  actionLabel = "Try again",
  actionIcon: ActionIcon = RotateCcw,
  secondaryAction,
}) {
  return (
    <div className="error-state">
      <div className="error-state__badge">
        <Icon size={28} strokeWidth={1.8} />
      </div>
      <h3 className="error-state__title">{title}</h3>
      <p className="error-state__desc">{description}</p>
      {(onRetry || secondaryAction) && (
        <div className="error-state__actions">
          {onRetry && (
            <Button variant="secondary" size="sm" icon={ActionIcon} onClick={onRetry}>
              {actionLabel}
            </Button>
          )}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
