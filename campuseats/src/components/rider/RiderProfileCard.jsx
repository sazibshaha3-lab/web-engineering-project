import { Pencil } from "lucide-react";
import Avatar from "../common/Avatar";
import { Badge } from "../common/Badge";
import Button from "../common/Button";
import "./RiderProfileCard.css";

const approvalTone = { APPROVED: "success", PENDING: "warning", REJECTED: "error", BLOCKED: "error" };

export default function RiderProfileCard({ rider, isAvailable, onEdit }) {
  return (
    <>
      <div className="rider-profile-card">
        <Avatar name={rider.name} size="lg" />
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ font: "var(--text-h3)", marginBottom: 4 }}>{rider.name}</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", marginBottom: 8 }}>{rider.email}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge tone={approvalTone[rider.approvalStatus] || "neutral"}>{rider.approvalStatus}</Badge>
            <Badge tone={isAvailable ? "success" : "neutral"}>{isAvailable ? "Available" : "Unavailable"}</Badge>
          </div>
        </div>
        <Button icon={Pencil} onClick={onEdit}>
          Edit Profile
        </Button>
      </div>

      <div className="rider-profile-card__grid">
        <div className="rider-profile-card__field">
          <span>Phone</span>
          <strong>{rider.phone}</strong>
        </div>
        <div className="rider-profile-card__field">
          <span>Vehicle type</span>
          <strong>{rider.vehicleType}</strong>
        </div>
        <div className="rider-profile-card__field">
          <span>Vehicle number</span>
          <strong>{rider.vehicleNumber}</strong>
        </div>
        <div className="rider-profile-card__field">
          <span>Rating</span>
          <strong>⭐ {rider.rating}</strong>
        </div>
        <div className="rider-profile-card__field">
          <span>Total deliveries</span>
          <strong>{rider.totalDeliveries}</strong>
        </div>
      </div>
    </>
  );
}
