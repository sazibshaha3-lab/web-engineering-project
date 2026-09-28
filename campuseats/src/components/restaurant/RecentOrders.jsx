import { Link } from "react-router-dom";
import Button from "../common/Button";
import OrderStatusBadge from "../order/OrderStatusBadge";
import EmptyState from "../common/EmptyState";
import { ClipboardList } from "lucide-react";
import { currentCustomer } from "../../data/users";

export default function RecentOrders({ orders }) {
  return (
    <div className="recent-orders">
      <h3 className="recent-orders__title">Recent Orders</h3>

      {orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No orders yet"
          description="New customer orders will appear here."
        />
      ) : (
        orders.map((order) => {
          const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
          return (
            <div className="recent-order-row" key={order.id}>
              <div className="recent-order-row__info">
                <p className="recent-order-row__id">{order.id} · {currentCustomer.name}</p>
                <p className="recent-order-row__meta">
                  {itemCount} item{itemCount > 1 ? "s" : ""} ·{" "}
                  {new Date(order.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
              <span className="recent-order-row__total">৳{order.total}</span>
              <Button as={Link} to={`/restaurant/orders/${order.id}`} variant="ghost" size="sm">
                View Order
              </Button>
            </div>
          );
        })
      )}
    </div>
  );
}
