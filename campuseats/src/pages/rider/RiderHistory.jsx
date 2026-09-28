import { useMemo, useState } from "react";
import { History, SearchX } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import CustomerSearch from "../../components/customer/CustomerSearch";
import OrderStatusBadge from "../../components/order/OrderStatusBadge";
import RiderEmptyState from "../../components/rider/RiderEmptyState";
import { useRider } from "../../context/RiderContext";
import { useRestaurantData } from "../../context/RestaurantContext";
import "./RiderHistory.css";

const tabs = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
];

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isSameWeek(a, b) {
  const oneDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.abs(Math.round((a - b) / oneDay));
  return diffDays <= 7;
}

export default function RiderHistory() {
  const { getDeliveryHistory } = useRider();
  const { restaurants } = useRestaurantData();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const history = useMemo(
    () => [...getDeliveryHistory()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [getDeliveryHistory]
  );

  const filtered = useMemo(() => {
    const now = new Date();
    const q = query.trim().toLowerCase();
    return history.filter((order) => {
      const created = new Date(order.createdAt);
      const matchesTab =
        tab === "all" ||
        (tab === "today" && isSameDay(created, now)) ||
        (tab === "week" && isSameWeek(created, now));
      const matchesQuery =
        !q || order.id.toLowerCase().includes(q) || order.restaurantName.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [history, tab, query]);

  return (
    <div className="fade-in">
      <PageHeader icon={History} title="Delivery History" description="Deliveries you've completed." />

      <div className="rhistory__toolbar">
        <div className="rhistory__search">
          <CustomerSearch value={query} onChange={setQuery} placeholder="Search by order ID or restaurant" size="sm" />
        </div>
      </div>

      <div className="rhistory__tabs">
        {tabs.map((t) => (
          <button
            key={t.value}
            className={`rhistory__tab ${tab === t.value ? "is-active" : ""}`}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <RiderEmptyState
          icon={SearchX}
          title="No deliveries found"
          description="Try another search or change your filters."
        />
      ) : (
        <div key={`${tab}-${query}`}>
          {filtered.map((order) => {
            const restaurant = restaurants.find((r) => r.id === order.restaurantId);
            return (
              <div className="rhistory__row" key={order.id}>
                <div className="rhistory__row-info">
                  <p className="rhistory__row-id">{order.id} · {restaurant?.name || order.restaurantName}</p>
                  <p className="rhistory__row-meta">
                    {order.deliveryAddress?.label} ·{" "}
                    {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
                <span className="rhistory__row-total">৳{order.total}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
