import { AlertTriangle } from "lucide-react";
import ImageWithFallback from "../common/ImageWithFallback";
import Button from "../common/Button";
import "./CartSummary.css";

export default function CartSummary({
  restaurant,
  subtotal,
  deliveryFee,
  discount = 0,
  meetsMinimum,
  amountNeeded,
  onCheckout,
  checkoutLabel = "Proceed to Checkout",
  disabled = false,
}) {
  const total = subtotal + deliveryFee - discount;

  return (
    <div className="cart-summary-card">
      {restaurant && (
        <div className="cart-summary-card__restaurant">
          <span className="cart-summary-card__restaurant-logo">
            <ImageWithFallback src={restaurant.logo} alt="" ratio="1 / 1" />
          </span>
          <div>
            <strong>{restaurant.name}</strong>
            <span>{restaurant.deliveryTime} · ৳{restaurant.deliveryFee} delivery</span>
          </div>
        </div>
      )}

      {!meetsMinimum && (
        <div className="cart-summary-card__min-order">
          <AlertTriangle size={16} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            Minimum order: ৳{restaurant?.minimumOrder}. Add ৳{amountNeeded} more to meet the minimum order.
          </span>
        </div>
      )}

      <div className="cart-summary-card__row">
        <span>Subtotal</span>
        <span>৳{subtotal}</span>
      </div>
      <div className="cart-summary-card__row">
        <span>Delivery fee</span>
        <span>৳{deliveryFee}</span>
      </div>
      {discount > 0 && (
        <div className="cart-summary-card__row cart-summary-card__row--discount">
          <span>Discount</span>
          <span>-৳{discount}</span>
        </div>
      )}
      <div className="cart-summary-card__total">
        <span>Total</span>
        <span>৳{total}</span>
      </div>

      <Button fullWidth size="lg" onClick={onCheckout} disabled={disabled || !meetsMinimum}>
        {checkoutLabel}
      </Button>
    </div>
  );
}
