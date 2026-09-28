import { useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import CustomerSearch from "../../components/customer/CustomerSearch";
import RestaurantOrderCard from "../../components/restaurant/RestaurantOrderCard";
import RestaurantEmptyState from "../../components/restaurant/RestaurantEmptyState";
import { useRestaurantData } from "../../context/RestaurantContext";
import { useOrders } from "../../context/OrderContext";
import { currentCustomer } from "../../data/users";
import "./RestaurantOrders.css";

const tabs = [
  { value: "all", label: "All", statuses: null },
  { value: "new", label: "New", statuses: ["PLACED"] },
  { value: "preparing", label: "Preparing", statuses: ["ACCEPTED", "PREPARING"] },
  { value: "ready", label: "Ready for Pickup", statuses: ["READY_FOR_PICKUP", "PICKED_UP", "OUT_FOR_DELIVERY"] },
  { value: "completed", label: "Completed", statuses: ["DELIVERED"] },
  { value: "cancelled", label: "Cancelled", statuses: ["CANCELLED"] },
  { value: "rejected", label: "Rejected", statuses: ["REJECTED"] },
];

export default function RestaurantOrders() {
  const { restaurant } = useRestaurantData();
  const { orders } = useOrders();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const restaurantOrders = useMemo(
    () => orders.filter((o) => o.restaurantId === restaurant?.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [orders, restaurant]
  );

  const activeTab = tabs.find((t) => t.value === tab);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return restaurantOrders.filter((o) => {
      const matchesTab = !activeTab.statuses || activeTab.statuses.includes(o.status);
      const matchesQuery =
        !q || o.id.toLowerCase().includes(q) || currentCustomer.name.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [restaurantOrders, activeTab, query]);

  return (
    <div className="fade-in">
      <PageHeader icon={ClipboardList} title="Orders" description="Incoming and past orders for your restaurant." />

      <div className="rorders__toolbar">
        <div className="rorders__search">
          <CustomerSearch value={query} onChange={setQuery} placeholder="Search by order ID or customer name" size="sm" />
        </div>
      </div>

      <div className="rorders__tabs">
        {tabs.map((t) => (
          <button
            key={t.value}
            className={`rorders__tab ${tab === t.value ? "is-active" : ""}`}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <RestaurantEmptyState
          icon={ClipboardList}
          title="No orders yet"
          description="New customer orders will appear here."
        />
      ) : (
        <div className="rorders__list" key={tab}>
          {filtered.map((order) => (
            <RestaurantOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
