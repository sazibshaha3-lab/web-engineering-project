import { Minus, Plus } from "lucide-react";
import "./QuantitySelector.css";

export default function QuantitySelector({ quantity, onChange, min = 1, max = 20, size = "md" }) {
  function decrease() {
    onChange(Math.max(min, quantity - 1));
  }
  function increase() {
    onChange(Math.min(max, quantity + 1));
  }

  return (
    <div className={`quantity-selector quantity-selector--${size}`}>
      <button type="button" onClick={decrease} disabled={quantity <= min} aria-label="Decrease quantity">
        <Minus size={15} strokeWidth={2.4} />
      </button>
      <span aria-live="polite" aria-atomic="true">{quantity}</span>
      <button type="button" onClick={increase} disabled={quantity >= max} aria-label="Increase quantity">
        <Plus size={15} strokeWidth={2.4} />
      </button>
    </div>
  );
}
