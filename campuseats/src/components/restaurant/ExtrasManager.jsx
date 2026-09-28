import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import IconButton from "../common/IconButton";
import "./ExtrasManager.css";

export default function ExtrasManager({ extras, onChange }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  function updateExtra(id, patch) {
    onChange(extras.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function removeExtra(id) {
    onChange(extras.filter((e) => e.id !== id));
  }

  function handleAdd() {
    const trimmedName = name.trim();
    const numericPrice = Number(price);
    if (!trimmedName || Number.isNaN(numericPrice) || numericPrice < 0) return;

    const isDuplicate = extras.some((e) => e.name.trim().toLowerCase() === trimmedName.toLowerCase());
    if (isDuplicate) {
      setError("An extra with this name already exists.");
      return;
    }

    onChange([...extras, { id: `e${Date.now()}`, name: trimmedName, price: numericPrice }]);
    setName("");
    setPrice("");
    setError("");
  }

  return (
    <div>
      {extras.length > 0 && (
        <div className="extras-manager__list">
          {extras.map((extra) => (
            <div className="extras-manager__row" key={extra.id}>
              <input
                className="extras-manager__name"
                value={extra.name}
                onChange={(e) => updateExtra(extra.id, { name: e.target.value })}
                aria-label="Extra name"
              />
              <input
                className="extras-manager__price"
                type="number"
                min="0"
                value={extra.price}
                onChange={(e) => updateExtra(extra.id, { price: Math.max(0, Number(e.target.value) || 0) })}
                aria-label="Extra price"
              />
              <IconButton icon={Trash2} label="Remove extra" size="sm" onClick={() => removeExtra(extra.id)} />
            </div>
          ))}
        </div>
      )}

      {error && <p className="extras-manager__error" role="alert">{error}</p>}

      <div className="extras-manager__add">
        <input
          placeholder="Extra name (e.g. Extra cheese)"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError("");
          }}
        />
        <input
          className="extras-manager__price-input"
          type="number"
          min="0"
          placeholder="৳ Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <IconButton icon={Plus} label="Add extra" variant="surface" onClick={handleAdd} />
      </div>
    </div>
  );
}
