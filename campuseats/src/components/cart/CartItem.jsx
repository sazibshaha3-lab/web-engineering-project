import { useState } from "react";
import { Trash2 } from "lucide-react";
import ImageWithFallback from "../common/ImageWithFallback";
import QuantitySelector from "../food/QuantitySelector";
import "./CartItem.css";

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const [removing, setRemoving] = useState(false);

  function handleRemove() {
    setRemoving(true);
    setTimeout(() => onRemove(item), 180);
  }

  return (
    <div className={`cart-item-row ${removing ? "is-removing" : ""}`}>
      <span className="cart-item-row__media">
        <ImageWithFallback src={item.image} alt={item.name} ratio="1 / 1" />
      </span>

      <div className="cart-item-row__info">
        <p className="cart-item-row__name">{item.name}</p>
        {item.extras?.length > 0 && (
          <p className="cart-item-row__extras">+ {item.extras.map((e) => e.name).join(", ")}</p>
        )}
        {item.customInstructions && <p className="cart-item-row__note">"{item.customInstructions}"</p>}
        <p className="cart-item-row__unit">৳{item.unitPrice} each</p>
      </div>

      <div className="cart-item-row__side">
        <span className="cart-item-row__total">৳{item.itemTotal}</span>
        <div className="cart-item-row__actions">
          <QuantitySelector
            quantity={item.quantity}
            min={1}
            max={20}
            size="sm"
            onChange={(qty) => onUpdateQuantity(item.id, qty)}
          />
          <button
            className="cart-item-row__remove"
            onClick={handleRemove}
            aria-label={`Remove ${item.name} from cart`}
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
