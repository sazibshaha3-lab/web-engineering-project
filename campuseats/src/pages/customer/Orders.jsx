import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, ShoppingBag, PackageOpen, CheckCircle2, XCircle } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import { SkeletonBlock } from "../../components/common/SkeletonLoader";
import OrderFilters from "../../components/order/OrderFilters";
import ActiveOrderCard from "../../components/order/ActiveOrderCard";
import OrderCard from "../../components/order/OrderCard";
import { useOrders } from "../../context/OrderContext";
import { isLiveOrderActive } from "../../utils/statusMaps";
import "./Orders.css";

const emptyCopy = {
  all: {
    icon: ShoppingBag,
    title: "No orders yet",
    description: "Your past and current orders will appear here.",
  },
  active: {
    icon: PackageOpen,
    title: "No active orders",
    description: "You don't have any orders being prepared or delivered right now.",
  },
  completed: {
    icon: CheckCircle2,
    title: "No completed orders yet",
    description: "Your completed orders will appear here after delivery.",
  },
  cancelled: {
    icon: XCircle,
    title: "No cancelled orders",
    description: "Orders you cancel will appear here.",
  },
};

export default function Orders() {
  const { orders, activeOrder } = useOrders();
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const filtered = orders.filter((o) => {
    if (tab === "active") return isLiveOrderActive(o.status);
    if (tab === "completed") return o.status === "DELIVERED";
    if (tab === "cancelled") return o.status === "CANCELLED" || o.status === "REJECTED";
    return true;
  });

  const copy = emptyCopy[tab];

  return (
    <div className="fade-in">
      <PageHeader icon={ClipboardList} title="My Orders" description="Track current deliveries and revisit past orders." />

      {loading ? (
        <>
          <SkeletonBlock height="120px" radius="var(--radius-xl)" style={{ display: "block", marginBottom: "var(--space-8)" }} />
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock
              key={i}
              height="132px"
              radius="var(--radius-lg)"
              style={{ display: "block", marginBottom: "var(--space-4)" }}
            />
          ))}
        </>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="Your past and current orders will appear here."
          action={
            <Button as={Link} to="/customer/restaurants">
              Browse Restaurants
            </Button>
          }
        />
      ) : (
        <>
          {activeOrder && <ActiveOrderCard order={activeOrder} />}

          <OrderFilters value={tab} onChange={setTab} />

          {filtered.length === 0 ? (
            <EmptyState
              icon={copy.icon}
              title={copy.title}
              description={copy.description}
              action={
                tab !== "cancelled" && (
                  <Button as={Link} to="/customer/restaurants">
                    Browse Restaurants
                  </Button>
                )
              }
            />
          ) : (
            filtered.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </>
      )}
    </div>
  );
}
