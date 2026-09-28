import "./OrderSummary.css";

export default function OrderSummary({ subtotal, deliveryFee, discount = 0, total }) {
  return (
    <div>
      <div className="order-price-summary__row">
        <span>Subtotal</span>
        <span>৳{subtotal}</span>
      </div>
      <div className="order-price-summary__row">
        <span>Delivery fee</span>
        <span>৳{deliveryFee}</span>
      </div>
      {discount > 0 && (
        <div className="order-price-summary__row order-price-summary__row--discount">
          <span>Discount</span>
          <span>-৳{discount}</span>
        </div>
      )}
      <div className="order-price-summary__total">
        <span>Total</span>
        <span>৳{total}</span>
      </div>
    </div>
  );
}
