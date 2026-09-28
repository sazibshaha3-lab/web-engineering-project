import { Link } from "react-router-dom";
import ImageWithFallback from "../common/ImageWithFallback";
import { Badge } from "../common/Badge";
import AdminStatusBadge from "./AdminStatusBadge";
import ApprovalActionButtons from "./ApprovalActionButtons";
import { useAdmin } from "../../context/AdminContext";

export default function RestaurantManagementTable({ restaurants }) {
  const { approveRestaurant, rejectRestaurant, blockRestaurant, unblockRestaurant, foods } = useAdmin();

  return (
    <div className="table-scroll">
      <table className="table admin-table">
        <thead>
          <tr>
            <th>Restaurant</th>
            <th>Owner</th>
            <th>Category</th>
            <th>Rating</th>
            <th>Status</th>
            <th>Open</th>
            <th>Menu</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {restaurants.map((r) => {
            const menuCount = foods.filter((f) => f.restaurantId === r.id).length;
            return (
              <tr key={r.id}>
                <td data-label="Restaurant">
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <span style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                      <ImageWithFallback src={r.logo} alt={r.name} ratio="1 / 1" />
                    </span>
                    <Link className="admin-table__row-link" to={`/admin/restaurants/${r.id}`}>
                      {r.name}
                    </Link>
                  </div>
                </td>
                <td data-label="Owner">{r.owner}</td>
                <td data-label="Category">{r.category}</td>
                <td data-label="Rating">{r.rating > 0 ? `⭐ ${r.rating}` : "—"}</td>
                <td data-label="Status">
                  {r.blocked ? <Badge tone="error">Blocked</Badge> : <AdminStatusBadge status={r.approvalStatus} />}
                </td>
                <td data-label="Open">
                  <Badge tone={r.isOpen ? "success" : "neutral"}>{r.isOpen ? "Open" : "Closed"}</Badge>
                </td>
                <td data-label="Menu">{menuCount} items</td>
                <td data-label="">
                  <ApprovalActionButtons
                    status={r.blocked ? "BLOCKED" : r.approvalStatus}
                    entityLabel={r.name}
                    onApprove={() => approveRestaurant(r.id)}
                    onReject={() => rejectRestaurant(r.id)}
                    onBlock={() => blockRestaurant(r.id)}
                    onUnblock={() => unblockRestaurant(r.id)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
