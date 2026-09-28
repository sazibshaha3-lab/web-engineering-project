import "./Badge.css";
import { accountStatusMap } from "../../utils/statusMaps";

export function Badge({ tone = "neutral", children, icon: Icon }) {
  return (
    <span className={`badge badge--${tone}`}>
      {Icon && <Icon size={12} strokeWidth={2.4} />}
      {children}
    </span>
  );
}

// Account status (customer active/inactive/blocked). Order status has its
// own dedicated <OrderStatusBadge> — see components/order/OrderStatusBadge.
export function StatusBadge({ status }) {
  const entry = accountStatusMap[status] || { label: status, tone: "neutral" };
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}
