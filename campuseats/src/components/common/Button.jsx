import { useState } from "react";
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
  ripple = true,
  as = "button",
  className = "",
  onPointerDown,
  ...rest
}) {
  const [ripples, setRipples] = useState([]);
  const Tag = as;

  function handlePointerDown(e) {
    if (ripple && !disabled && !loading) {
      const rect = e.currentTarget.getBoundingClientRect();
      const diameter = Math.max(rect.width, rect.height) * 1.6;
      const x = e.clientX - rect.left - diameter / 2;
      const y = e.clientY - rect.top - diameter / 2;
      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev.slice(-3), { x, y, size: diameter, id }]);
    }
    onPointerDown?.(e);
  }

  function removeRipple(id) {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <Tag
      className={`btn btn--${variant} btn--${size} ${fullWidth ? "btn--full" : ""} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onPointerDown={handlePointerDown}
      {...rest}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="btn__ripple"
          style={{
            left: `${r.x}px`,
            top: `${r.y}px`,
            width: `${r.size}px`,
            height: `${r.size}px`,
          }}
          onAnimationEnd={() => removeRipple(r.id)}
        />
      ))}
      {loading && <Loader2 className="btn__spinner" size={16} />}
      {!loading && Icon && iconPosition === "left" && <Icon size={17} strokeWidth={2} className="btn__icon" />}
      {children && <span className="btn__text">{children}</span>}
      {!loading && Icon && iconPosition === "right" && <Icon size={17} strokeWidth={2} className="btn__icon" />}
    </Tag>
  );
}
