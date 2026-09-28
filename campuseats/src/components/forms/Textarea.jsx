import "./Textarea.css";

export default function Textarea({ label, id, hint, error, rows = 4, ...rest }) {
  const areaId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={`field ${error ? "field--error" : ""}`}>
      {label && (
        <label htmlFor={areaId} className="field__label">
          {label}
        </label>
      )}
      <textarea id={areaId} className="textarea" rows={rows} {...rest} />
      {error ? (
        <p className="field__message field__message--error">{error}</p>
      ) : (
        hint && <p className="field__message">{hint}</p>
      )}
    </div>
  );
}
