import { Link } from "react-router-dom";
import Avatar from "../common/Avatar";
import AdminStatusBadge from "./AdminStatusBadge";
import ApprovalActionButtons from "./ApprovalActionButtons";
import { useAdmin } from "../../context/AdminContext";
import { LIVE_RIDER_ID } from "../../data/riders";

export default function RiderManagementTable({ riders }) {
  const { approveRider, rejectRider, blockRider, unblockRider } = useAdmin();

  return (
    <div className="table-scroll">
      <table className="table admin-table">
        <thead>
          <tr>
            <th>Rider</th>
            <th>Vehicle</th>
            <th>Rating</th>
            <th>Deliveries</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {riders.map((r) => (
            <tr key={r.id}>
              <td data-label="Rider">
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <Avatar name={r.name} size="sm" />
                  <div>
                    <Link className="admin-table__row-link" to={`/admin/riders/${r.id}`}>
                      {r.name}
                    </Link>
                    {r.id === LIVE_RIDER_ID && <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>Demo account</div>}
                  </div>
                </div>
              </td>
              <td data-label="Vehicle">
                {r.vehicleType}
                {r.vehicleNumber && r.vehicleNumber !== "—" ? ` · ${r.vehicleNumber}` : ""}
              </td>
              <td data-label="Rating">{r.rating > 0 ? `⭐ ${r.rating}` : "—"}</td>
              <td data-label="Deliveries">{r.totalDeliveries}</td>
              <td data-label="Status">
                <AdminStatusBadge status={r.approvalStatus} />
              </td>
              <td data-label="">
                <ApprovalActionButtons
                  status={r.approvalStatus}
                  entityLabel={r.name}
                  onApprove={() => approveRider(r.id)}
                  onReject={() => rejectRider(r.id)}
                  onBlock={() => blockRider(r.id)}
                  onUnblock={() => unblockRider(r.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
