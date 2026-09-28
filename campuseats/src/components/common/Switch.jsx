import "./Switch.css";

export default function Switch({ checked, onChange, label, size = "md" }) {
  return (
    <label className={`switch switch--${size}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
      />
      <span className="switch__track">
        <span className="switch__thumb" />
      </span>
      {label && <span className="switch__label">{label}</span>}
    </label>
  );
}
