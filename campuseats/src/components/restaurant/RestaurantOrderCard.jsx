import { Link } from "react-router-dom";
import { MapPin, Wallet2 } from "lucide-react";
import Button from "../common/Button";
import OrderStatusBadge from "../order/OrderStatusBadge";
import { currentCustomer } from "../../data/users";

const paymentLabels = { cod: "Cash on Delivery", online: "Online Payment" };

function summarizeItems(items) {
  const [first, ...rest] = items;
  if (!first) return "";
  const base = `${first.name} × ${first.quantity}`;
  if (rest.length === 0) return base;
  return `${base} + ${rest.length} more`;
}

export default function RestaurantOrderCard({ order }) {
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="rorder-card">
      <div className="rorder-card__top">
        <div>
          <p className="rorder-card__id">{order.id} · {currentCustomer.name}</p>
          <p className="rorder-card__meta">
            {itemCount} item{itemCount > 1 ? "s" : ""} ·{" "}
            {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <p className="rorder-card__summary">{summarizeItems(order.items)}</p>

      <div className="rorder-card__footer">
        <div className="rorder-card__info">
          <span><MapPin size={13} strokeWidth={2} /> {order.deliveryAddress?.label}</span>
          <span><Wallet2 size={13} strokeWidth={2} /> {paymentLabels[order.paymentMethod] || order.paymentMethod}</span>
          <span className="rorder-card__total">৳{order.total}</span>
        </div>
        <Button as={Link} to={`/restaurant/orders/${order.id}`} variant="secondary" size="sm">
          View Order
        </Button>
      </div>
    </div>
  );
}
