import { ClipboardList } from "lucide-react";
import Avatar from "../common/Avatar";
import { Badge } from "../common/Badge";
import AdminStatusBadge from "./AdminStatusBadge";
import AdminOrderTable from "./AdminOrderTable";
import AdminEmptyState from "./AdminEmptyState";
import { LIVE_RIDER_ID } from "../../data/riders";

const ACTIVE_STATUSES = ["READY_FOR_PICKUP", "PICKED_UP", "OUT_FOR_DELIVERY"];

export default function RiderDetails({ rider, orders, isAvailable }) {
  const isLive = rider.id === LIVE_RIDER_ID;
  const assigned = orders.filter((o) => o.riderId === rider.id && ACTIVE_STATUSES.includes(o.status));
  const history = orders.filter((o) => o.riderId === rider.id && o.status === "DELIVERED");

  return (
    <div>
      <div
        className="dashboard-panel admin-detail__panel"
        style={{ display: "flex", alignItems: "center", gap: "var(--space-5)", flexWrap: "wrap" }}
      >
        <Avatar name={rider.name} size="lg" />
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ font: "var(--text-h3)", marginBottom: 4 }}>
            {rider.name} {isLive && <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>(Demo account)</span>}
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", marginBottom: 8 }}>{rider.email}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <AdminStatusBadge status={rider.approvalStatus} />
            {isLive && <Badge tone={isAvailable ? "success" : "neutral"}>{isAvailable ? "Available" : "Unavailable"}</Badge>}
          </div>
        </div>
      </div>

      <div className="dashboard-panel admin-detail__panel">
        <h3>Vehicle & contact</h3>
        <div className="admin-detail__field">
          <span>Phone</span>
          <span>{rider.phone}</span>
        </div>
        <div className="admin-detail__field">
          <span>Vehicle type</span>
          <span>{rider.vehicleType}</span>
        </div>
        <div className="admin-detail__field">
          <span>Vehicle number</span>
          <span>{rider.vehicleNumber || "—"}</span>
        </div>
        <div className="admin-detail__field">
          <span>Rating</span>
          <span>{rider.rating > 0 ? `⭐ ${rider.rating}` : "No ratings yet"}</span>
        </div>
        <div className="admin-detail__field">
          <span>Total deliveries</span>
          <span>{rider.totalDeliveries}</span>
        </div>
      </div>

      <div className="dashboard-panel admin-detail__panel">
        <h3>Current delivery</h3>
        {assigned.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem" }}>No delivery currently assigned.</p>
        ) : (
          <AdminOrderTable orders={assigned} />
        )}
      </div>

      <div className="dashboard-panel admin-detail__panel">
        <h3>Delivery history</h3>
        {history.length === 0 ? (
          <AdminEmptyState icon={ClipboardList} title="No deliveries yet" description="Completed deliveries will appear here." />
        ) : (
          <AdminOrderTable orders={history} />
        )}
      </div>
    </div>
  );
}
