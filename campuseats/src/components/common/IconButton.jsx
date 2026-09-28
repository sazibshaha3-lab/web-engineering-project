import "./IconButton.css";

export default function IconButton({ icon: Icon, label, variant = "ghost", size = "md", badge, ...rest }) {
  return (
    <button
      type="button"
      className={`icon-btn icon-btn--${variant} icon-btn--${size}`}
      aria-label={label}
      title={label}
      {...rest}
    >
      <Icon size={size === "sm" ? 16 : 19} strokeWidth={2} />
      {badge ? <span className="icon-btn__badge">{badge}</span> : null}
    </button>
  );
}
