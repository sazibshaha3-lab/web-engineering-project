import ImageWithFallback from "../common/ImageWithFallback";
import "./CheckoutSummary.css";

const paymentLabels = { cod: "Cash on Delivery", online: "Online Payment" };

export default function CheckoutSummary({
  restaurant,
  items,
  subtotal,
  deliveryFee,
  discount = 0,
  address,
  instructions,
  paymentMethod,
}) {
  const total = subtotal + deliveryFee - discount;

  return (
    <div className="checkout-summary">
      {restaurant && (
        <div className="checkout-summary__restaurant">
          <span className="checkout-summary__restaurant-logo">
            <ImageWithFallback src={restaurant.logo} alt="" ratio="1 / 1" />
          </span>
          <div>
            <strong>{restaurant.name}</strong>
            <span style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
              Estimated {restaurant.deliveryTime}
            </span>
          </div>
        </div>
      )}

      <div className="checkout-summary__items">
        {items.map((item) => (
          <div className="checkout-summary__item" key={item.id}>
            <span className="checkout-summary__item-name">
              {item.quantity} × {item.name}
              {item.extras?.length > 0 && (
                <span className="checkout-summary__item-extras">
                  + {item.extras.map((e) => e.name).join(", ")}
                </span>
              )}
            </span>
            <span>৳{item.itemTotal}</span>
          </div>
        ))}
      </div>

      <div className="checkout-summary__row">
        <span>Subtotal</span>
        <span>৳{subtotal}</span>
      </div>
      <div className="checkout-summary__row">
        <span>Delivery fee</span>
        <span>৳{deliveryFee}</span>
      </div>
      {discount > 0 && (
        <div className="checkout-summary__row checkout-summary__row--discount">
          <span>Discount</span>
          <span>-৳{discount}</span>
        </div>
      )}
      <div className="checkout-summary__total">
        <span>Total</span>
        <span>৳{total}</span>
      </div>

      <div className="checkout-summary__meta">
        <span>
          <strong>Deliver to: </strong>
          {address ? `${address.label} — ${address.line}` : "No address selected"}
        </span>
        {instructions && (
          <span>
            <strong>Note: </strong>"{instructions}"
          </span>
        )}
        <span>
          <strong>Payment: </strong>
          {paymentLabels[paymentMethod] || "Not selected"}
        </span>
      </div>
    </div>
  );
}
