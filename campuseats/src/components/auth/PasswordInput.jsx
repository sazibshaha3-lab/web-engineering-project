import { forwardRef, useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import "../forms/Input.css";

const PasswordInput = forwardRef(function PasswordInput(
  { label, error, hint, id, ...rest },
  ref
) {
  const [visible, setVisible] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`field ${error ? "field--error" : ""}`}>
      {label && (
        <label htmlFor={inputId} className="field__label">
          {label}
        </label>
      )}
      <div className="field__control field__control--md">
        <Lock size={17} strokeWidth={2} className="field__icon" />
        <input
          ref={ref}
          id={inputId}
          type={visible ? "text" : "password"}
          className="field__input"
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          style={{ color: "var(--color-text-muted)", display: "flex", flexShrink: 0 }}
        >
          {visible ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
        </button>
      </div>
      {error ? (
        <p className="field__message field__message--error">{error}</p>
      ) : (
        hint && <p className="field__message">{hint}</p>
      )}
    </div>
  );
});

export default PasswordInput;
