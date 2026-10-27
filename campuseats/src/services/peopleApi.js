// Backend rider row (+ nested user) -> the flat rider shape the Rider/Admin UI expects.
export function normalizeRider(r) {
  const u = r.user ?? {};
  return {
    id: String(r.id),
    userId: String(r.userId ?? u.id ?? ""),
    name: u.name ?? r.name ?? "",
    email: u.email ?? r.email ?? "",
    phone: u.phone ?? r.phone ?? "",
    avatar: u.avatar ?? r.avatar ?? null,
    vehicleType: r.vehicleType ?? "",
    vehicleNumber: r.vehicleNumber ?? "",
    rating: Number(r.rating) || 0,
    totalDeliveries: Number(r.totalDeliveries) || 0,
    approvalStatus: r.approvalStatus ?? r.approval_status,
  };
}

// /admin/customers row -> Admin Customers panel shape (`orders` is the order count).
export function normalizeCustomer(u) {
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    phone: u.phone ?? "",
    orders: Number(u.ordersCount) || 0,
    status: u.status ?? "active",
  };
}
