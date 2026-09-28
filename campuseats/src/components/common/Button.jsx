import { Loader2 } from "lucide-react";
import "./Button.css";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  fullWidth = false,
  as = "button",
  ...rest
}) {
  const Tag = as;
  return (
    <Tag
      className={`btn btn--${variant} btn--${size} ${fullWidth ? "btn--full" : ""}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Loader2 className="btn__spinner" size={16} />}
      {!loading && Icon && iconPosition === "left" && <Icon size={17} strokeWidth={2} />}
      {children && <span>{children}</span>}
      {!loading && Icon && iconPosition === "right" && <Icon size={17} strokeWidth={2} />}
    </Tag>
  );
}
