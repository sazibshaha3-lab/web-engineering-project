import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import OrderStatusBadge from "./OrderStatusBadge";
import Button from "../common/Button";
import "./OrderSuccess.css";

const paymentLabels = { cod: "Cash on Delivery", online: "Online Payment" };

export default function OrderSuccess({ order }) {
  return (
    <div className="order-success">
      <div className="order-success__icon">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path
            className="order-success__check"
            d="M10 21l6 6 14-14"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="order-success__title">Order placed successfully!</h1>
      <p className="order-success__desc">
        Your order has been received and the restaurant will start preparing it shortly.
      </p>

      <div className="order-success__card">
        <div className="order-success__card-top">
          <span className="order-success__order-id">{order.id}</span>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="order-success__row">
          <span>Restaurant</span>
          <strong>{order.restaurantName}</strong>
        </div>
        <div className="order-success__row">
          <span>Total</span>
          <strong>৳{order.total}</strong>
        </div>
        <div className="order-success__row">
          <span>Payment method</span>
          <strong>{paymentLabels[order.paymentMethod] || order.paymentMethod}</strong>
        </div>
        <div className="order-success__row">
          <span>Delivery address</span>
          <strong>{order.deliveryAddress?.label} — {order.deliveryAddress?.line}</strong>
        </div>
        {order.deliveryInstructions && (
          <div className="order-success__row">
            <span>Instructions</span>
            <strong>"{order.deliveryInstructions}"</strong>
          </div>
        )}

        <div className="order-success__eta">
          <Clock size={18} strokeWidth={2} />
          <div>
            <div style={{ fontSize: "0.78rem", opacity: 0.85 }}>Estimated delivery</div>
            <div>{order.estimatedDeliveryTime}</div>
          </div>
        </div>
      </div>

      <div className="order-success__actions">
        <Button as={Link} to={`/customer/orders/${order.id}/track`} variant="secondary" fullWidth>
          View Order
        </Button>
        <Button as={Link} to="/customer" fullWidth>
          Continue Browsing
        </Button>
      </div>
    </div>
  );
}
