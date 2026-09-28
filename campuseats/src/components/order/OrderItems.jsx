import ImageWithFallback from "../common/ImageWithFallback";
import "./OrderItems.css";

export default function OrderItems({ items }) {
  return (
    <div className="order-items">
      {items.map((item) => (
        <div className="order-items__row" key={item.id}>
          <span className="order-items__media">
            <ImageWithFallback src={item.image} alt={item.name} ratio="1 / 1" />
          </span>
          <div className="order-items__info">
            <p className="order-items__name">{item.name}</p>
            <p className="order-items__qty">
              {item.quantity} × ৳{item.unitPrice}
            </p>
            {item.extras?.length > 0 && (
              <p className="order-items__extras">+ {item.extras.map((e) => e.name).join(", ")}</p>
            )}
            {item.customInstructions && <p className="order-items__note">"{item.customInstructions}"</p>}
          </div>
          <span className="order-items__total">৳{item.itemTotal}</span>
        </div>
      ))}
    </div>
  );
}
