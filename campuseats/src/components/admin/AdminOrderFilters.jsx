const tabs = [
  { value: "all", label: "All" },
  { value: "PLACED", label: "Placed" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { value: "PICKED_UP", label: "Picked Up" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function AdminOrderFilters({ value, onChange }) {
  return (
    <div className="admin-tabs" role="tablist" aria-label="Filter orders by status">
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          aria-selected={value === t.value}
          className={`admin-tabs__tab ${value === t.value ? "is-active" : ""}`}
          onClick={() => onChange(t.value)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
