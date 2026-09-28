import { forwardRef } from "react";
import "./Input.css";

const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, id, size = "md", ...rest },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={`field ${error ? "field--error" : ""}`}>
      {label && (
        <label htmlFor={inputId} className="field__label">
          {label}
        </label>
      )}
      <div className={`field__control field__control--${size}`}>
        {Icon && <Icon size={17} strokeWidth={2} className="field__icon" />}
        <input ref={ref} id={inputId} className="field__input" {...rest} />
      </div>
      {error ? (
        <p className="field__message field__message--error">{error}</p>
      ) : (
        hint && <p className="field__message">{hint}</p>
      )}
    </div>
  );
});

export default Input;
