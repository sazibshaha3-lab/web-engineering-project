import { ChevronDown } from "lucide-react";
import "./Select.css";

export default function Select({ label, id, options = [], hint, ...rest }) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="field">
      {label && (
        <label htmlFor={selectId} className="field__label">
          {label}
        </label>
      )}
      <div className="select__control">
        <select id={selectId} className="select__input" {...rest}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="select__caret" />
      </div>
      {hint && <p className="field__message">{hint}</p>}
    </div>
  );
}
