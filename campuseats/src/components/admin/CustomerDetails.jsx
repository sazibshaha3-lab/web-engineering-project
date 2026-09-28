import Avatar from "../common/Avatar";
import { StatusBadge } from "../common/Badge";
import { currentCustomer } from "../../data/users";
import AdminOrderTable from "./AdminOrderTable";
import AdminEmptyState from "./AdminEmptyState";
import { ClipboardList } from "lucide-react";

const LIVE_CUSTOMER_ID = "u1";

export default function CustomerDetails({ customer, orders }) {
  const isLive = customer.id === LIVE_CUSTOMER_ID;
  const completed = orders.filter((o) => o.status === "DELIVERED").length;
  const cancelled = orders.filter((o) => o.status === "CANCELLED" || o.status === "REJECTED").length;

  return (
    <div>
      <div className="dashboard-panel admin-detail__panel" style={{ display: "flex", alignItems: "center", gap: "var(--space-5)", flexWrap: "wrap" }}>
        <Avatar name={customer.name} size="lg" />
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ font: "var(--text-h3)", marginBottom: 4 }}>{customer.name}</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", marginBottom: 8 }}>{customer.email}</p>
          <StatusBadge status={customer.status} />
        </div>
      </div>

      <div className="dashboard-panel admin-detail__panel">
        <h3>Contact</h3>
        <div className="admin-detail__field">
          <span>Phone</span>
          <span>{customer.phone}</span>
        </div>
        {isLive && (
          <div className="admin-detail__field">
            <span>Saved locations</span>
            <span>{currentCustomer.savedLocations.length}</span>
          </div>
        )}
      </div>

      <div className="dashboard-panel admin-detail__panel">
        <h3>Order summary</h3>
        <div className="admin-detail__field">
          <span>Total orders</span>
          <span>{isLive ? orders.length : customer.orders}</span>
        </div>
        {isLive && (
          <>
            <div className="admin-detail__field">
              <span>Completed orders</span>
              <span>{completed}</span>
            </div>
            <div className="admin-detail__field">
              <span>Cancelled / rejected orders</span>
              <span>{cancelled}</span>
            </div>
          </>
        )}
      </div>

      <div className="dashboard-panel admin-detail__panel">
        <h3>Order history</h3>
        {!isLive ? (
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem" }}>
            Detailed order history is only available for the active demo account.
          </p>
        ) : orders.length === 0 ? (
          <AdminEmptyState icon={ClipboardList} title="No orders yet" description="This customer hasn't placed an order yet." />
        ) : (
          <AdminOrderTable orders={orders} />
        )}
      </div>
    </div>
  );
}
