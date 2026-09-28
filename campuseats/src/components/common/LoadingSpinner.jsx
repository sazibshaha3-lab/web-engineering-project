import { Loader2 } from "lucide-react";
import "./LoadingSpinner.css";

export default function LoadingSpinner({ label = "Loading", size = 22 }) {
  return (
    <div className="loading-spinner" role="status">
      <Loader2 size={size} className="loading-spinner__icon" />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}
