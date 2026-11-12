import { Link } from "react-router-dom";
import Button from "../common/Button";
import OrderStatusBadge from "../order/OrderStatusBadge";
import EmptyState from "../common/EmptyState";
import { ClipboardList, ArrowRight } from "lucide-react";

export default function RecentOrders({ orders }) {
  return (
    <div className="recent-orders">
      <div className="recent-orders__header">
        <div>
          <h3 className="recent-orders__title">Recent Orders</h3>
          <p className="recent-orders__subtitle">Live incoming orders from campus customers</p>
        </div>
        <Link to="/restaurant/orders" className="recent-orders__view-all">
          View all orders <ArrowRight size={15} />
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Ready for your first order"
          description="New student and campus customer orders will appear here in real-time."
          action={
            <Button as={Link} to="/restaurant/menu" variant="secondary" size="sm">
              Manage Menu Dishes
            </Button>
          }
        />
      ) : (
        orders.map((order) => {
          const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
          return (
            <div className="recent-order-row" key={order.id}>
              <div className="recent-order-row__info">
                <p className="recent-order-row__id">{order.id} · {order.customer?.name || "Customer"}</p>
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
