import { Link } from "react-router-dom";
import ImageWithFallback from "../common/ImageWithFallback";
import OrderStatusBadge from "./OrderStatusBadge";
import ReorderButton from "./ReorderButton";
import Button from "../common/Button";
import { isLiveOrderActive } from "../../utils/statusMaps";
import "./OrderCard.css";

function summarizeItems(items) {
  const [first, ...rest] = items;
  if (!first) return "";
  const restCount = rest.length;
  const base = `${first.name} × ${first.quantity}`;
  if (restCount === 0) return base;
  if (restCount === 1) return `${base}, ${rest[0].name} × ${rest[0].quantity}`;
  return `${base}, ${rest[0].name} × ${rest[0].quantity} + ${restCount - 1} more`;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " · " +
    d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function OrderCard({ order }) {
  const active = isLiveOrderActive(order.status);
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="order-card">
      <span className="order-card__logo">
        <ImageWithFallback src={order.restaurantLogo} alt={order.restaurantName} ratio="1 / 1" />
      </span>
      <div className="order-card__body">
        <div className="order-card__top">
          <span className="order-card__restaurant">{order.restaurantName}</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="order-card__meta">
          {order.id} · {formatDate(order.createdAt)} · {itemCount} item{itemCount > 1 ? "s" : ""}
        </p>
        <p className="order-card__summary">{summarizeItems(order.items)}</p>

        <div className="order-card__footer">
          <span className="order-card__total">৳{order.total}</span>
          <div className="order-card__actions">
            <Button as={Link} to={`/customer/orders/${order.id}`} variant="ghost" size="sm">
              View Details
            </Button>
            {active && (
              <Button as={Link} to={`/customer/orders/${order.id}/track`} variant="secondary" size="sm">
                Track Order
              </Button>
            )}
            {order.status === "DELIVERED" && (
              <ReorderButton orderId={order.id} restaurantId={order.restaurantId} size="sm" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
