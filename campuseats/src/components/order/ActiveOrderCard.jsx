import { Link } from "react-router-dom";
import ImageWithFallback from "../common/ImageWithFallback";
import OrderStatusBadge from "./OrderStatusBadge";
import Button from "../common/Button";
import "./ActiveOrderCard.css";

export default function ActiveOrderCard({ order }) {
  return (
    <div className="active-order-card">
      <span className="active-order-card__logo">
        <ImageWithFallback src={order.restaurantLogo} alt={order.restaurantName} ratio="1 / 1" />
      </span>
      <div className="active-order-card__body">
        <p className="active-order-card__eyebrow">Active order</p>
        <h3 className="active-order-card__restaurant">{order.restaurantName}</h3>
        <div className="active-order-card__meta">
          <OrderStatusBadge status={order.status} />
          <span>Estimated delivery: {order.estimatedDeliveryTime}</span>
          <span>Total: ৳{order.total}</span>
        </div>
      </div>
      <div className="active-order-card__actions">
        <Button as={Link} to={`/customer/orders/${order.id}/track`} variant="secondary">
          Track Order
        </Button>
      </div>
    </div>
  );
}
