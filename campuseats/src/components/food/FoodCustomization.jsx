import { useEffect, useRef, useState } from "react";
import QuantitySelector from "./QuantitySelector";
import ExtrasSelector from "./ExtrasSelector";
import Textarea from "../forms/Textarea";
import "./FoodCustomization.css";

export default function FoodCustomization({ food, onStateChange }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [instructions, setInstructions] = useState("");
  const [pop, setPop] = useState(false);
  const prevTotal = useRef(null);

  const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const total = (food.price + extrasTotal) * quantity;

  useEffect(() => {
    onStateChange?.({ quantity, extras: selectedExtras, customInstructions: instructions, total });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity, selectedExtras, instructions]);

  useEffect(() => {
    if (prevTotal.current !== null && prevTotal.current !== total) {
      setPop(true);
      prevTotal.current = total;
      const t = setTimeout(() => setPop(false), 220);
      return () => clearTimeout(t);
    }
    prevTotal.current = total;
  }, [total]);

  function toggleExtra(extra) {
    setSelectedExtras((prev) =>
      prev.some((e) => e.id === extra.id) ? prev.filter((e) => e.id !== extra.id) : [...prev, extra]
    );
  }

  return (
    <div className="food-customization">
      <div className="food-customization__row">
        <span className="food-customization__label">Quantity</span>
        <QuantitySelector quantity={quantity} onChange={setQuantity} />
      </div>

      {food.extras?.length > 0 && (
        <ExtrasSelector
          extras={food.extras}
          selectedIds={selectedExtras.map((e) => e.id)}
          onToggle={toggleExtra}
        />
      )}

      <div className="food-customization__notes">
        <Textarea
          label="Custom instructions (optional)"
          placeholder="e.g. less spicy, no onions, extra sauce"
          rows={2}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
      </div>

      <div className="food-customization__total">
        <span>Total</span>
        <span className={`food-customization__price ${pop ? "is-popping" : ""}`}>৳{total}</span>
      </div>
    </div>
  );
}
