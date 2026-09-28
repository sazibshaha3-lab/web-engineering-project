import { liveOrderStatusMap, isLiveOrderActive } from "../../utils/statusMaps";
import "./OrderStatusBadge.css";

export default function OrderStatusBadge({ status }) {
  const meta = liveOrderStatusMap[status] || { label: status, tone: "neutral" };
  const live = isLiveOrderActive(status) && status !== "PLACED";

  return (
    <span className={`order-status-badge order-status-badge--${meta.tone} ${live ? "order-status-badge--live" : ""}`}>
      <span className="order-status-badge__dot" />
      {meta.label}
    </span>
  );
}
