import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import "./InlineMessage.css";

const icons = { error: AlertCircle, success: CheckCircle2, info: Info };

export default function InlineMessage({ tone = "info", children }) {
  if (!children) return null;
  const Icon = icons[tone] || Info;
  return (
    <div className={`inline-message inline-message--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <Icon size={16} strokeWidth={2} />
      <span>{children}</span>
    </div>
  );
}
