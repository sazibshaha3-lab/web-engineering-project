import "./ExtrasSelector.css";

export default function ExtrasSelector({ extras = [], selectedIds = [], onToggle }) {
  if (!extras.length) return null;

  return (
    <div className="extras-selector">
      <p className="extras-selector__title">Add extras</p>
      <div className="extras-selector__list">
        {extras.map((extra) => {
          const checked = selectedIds.includes(extra.id);
          return (
            <label key={extra.id} className={`extras-selector__item ${checked ? "is-selected" : ""}`}>
              <span className="extras-selector__check">
                <input type="checkbox" checked={checked} onChange={() => onToggle(extra)} />
                <span className="extras-selector__box" aria-hidden="true" />
                {extra.name}
              </span>
              <span className="extras-selector__price">{extra.price > 0 ? `+৳${extra.price}` : "Free"}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
