import ImageWithFallback from "../common/ImageWithFallback";
import { Badge } from "../common/Badge";
import AdminStatusBadge from "./AdminStatusBadge";
import AdminOrderTable from "./AdminOrderTable";
import AdminEmptyState from "./AdminEmptyState";
import { ClipboardList } from "lucide-react";

export default function RestaurantDetails({ restaurant, menu, orders }) {
  return (
    <div>
      <div className="dashboard-panel admin-detail__panel" style={{ display: "flex", alignItems: "center", gap: "var(--space-5)", flexWrap: "wrap" }}>
        <span style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
          <ImageWithFallback src={restaurant.logo} alt={restaurant.name} ratio="1 / 1" />
        </span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ font: "var(--text-h3)", marginBottom: 4 }}>{restaurant.name}</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", marginBottom: 8 }}>{restaurant.owner}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {restaurant.blocked ? <Badge tone="error">Blocked</Badge> : <AdminStatusBadge status={restaurant.approvalStatus} />}
            <Badge tone={restaurant.isOpen ? "success" : "neutral"}>{restaurant.isOpen ? "Open" : "Closed"}</Badge>
          </div>
        </div>
      </div>

      <div className="dashboard-panel admin-detail__panel">
        <h3>Business information</h3>
        <div className="admin-detail__field">
          <span>Category</span>
          <span>{restaurant.category}</span>
        </div>
        <div className="admin-detail__field">
          <span>Address</span>
          <span>{restaurant.address}</span>
        </div>
        <div className="admin-detail__field">
          <span>Hours</span>
          <span>{restaurant.openingTime} – {restaurant.closingTime}</span>
        </div>
        <div className="admin-detail__field">
          <span>Delivery fee</span>
          <span>৳{restaurant.deliveryFee}</span>
        </div>
        <div className="admin-detail__field">
          <span>Minimum order</span>
          <span>৳{restaurant.minimumOrder}</span>
        </div>
        <div className="admin-detail__field">
          <span>Rating</span>
          <span>{restaurant.rating > 0 ? `⭐ ${restaurant.rating} (${restaurant.reviewCount})` : "No ratings yet"}</span>
        </div>
      </div>

      <div className="dashboard-panel admin-detail__panel">
        <h3>Menu</h3>
        {menu.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem" }}>No menu items yet.</p>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                {menu.map((f) => (
                  <tr key={f.id}>
                    <td>{f.name}</td>
                    <td>{f.category}</td>
                    <td>৳{f.price}</td>
                    <td>
                      <Badge tone={f.isAvailable ? "success" : "neutral"}>{f.isAvailable ? "Available" : "Unavailable"}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dashboard-panel admin-detail__panel">
        <h3>Orders</h3>
        {orders.length === 0 ? (
          <AdminEmptyState icon={ClipboardList} title="No orders yet" description="Orders for this restaurant will appear here." />
        ) : (
          <AdminOrderTable orders={orders} />
        )}
      </div>
    </div>
  );
}
