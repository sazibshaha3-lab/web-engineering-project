// The single source of truth for order status everywhere in the app —
// Customer, Restaurant, Rider and Admin all render status from this same
// map via <OrderStatusBadge>, so the same status always looks identical
// across every role.
export const liveOrderStatusFlow = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export const liveOrderTerminalStatuses = ["REJECTED", "CANCELLED"];

export const liveOrderStatusMap = {
  PLACED: { label: "Placed", tone: "info", banner: "Order received" },
  ACCEPTED: { label: "Accepted", tone: "info", banner: "Restaurant accepted your order" },
  PREPARING: { label: "Preparing", tone: "warning", banner: "Your food is being prepared" },
  READY_FOR_PICKUP: { label: "Ready for pickup", tone: "warning", banner: "Your order is ready for pickup" },
  PICKED_UP: { label: "Picked up", tone: "warning", banner: "Rider picked up your order" },
  OUT_FOR_DELIVERY: { label: "Out for delivery", tone: "warning", banner: "Your order is on the way" },
  DELIVERED: { label: "Delivered", tone: "success", banner: "Order delivered" },
  REJECTED: { label: "Rejected", tone: "error", banner: "Order was rejected" },
  CANCELLED: { label: "Cancelled", tone: "error", banner: "Order cancelled" },
};

export function isLiveOrderActive(status) {
  return liveOrderStatusFlow.includes(status) && status !== "DELIVERED";
}

export const accountStatusMap = {
  pending: { label: "Pending review", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "error" },
  blocked: { label: "Blocked", tone: "error" },
  active: { label: "Active", tone: "success" },
  inactive: { label: "Inactive", tone: "neutral" },
};
