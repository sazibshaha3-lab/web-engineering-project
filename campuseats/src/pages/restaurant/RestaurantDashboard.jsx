import { useMemo } from "react";
import { Link } from "react-router-dom";
import { UtensilsCrossed, ClipboardList, Store } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import DashboardStats from "../../components/restaurant/DashboardStats";
import RestaurantStatusToggle from "../../components/restaurant/RestaurantStatusToggle";
import RecentOrders from "../../components/restaurant/RecentOrders";
import { useRestaurantData } from "../../context/RestaurantContext";
import { useOrders } from "../../context/OrderContext";
import { currentRestaurantOwner } from "../../data/users";
import "./RestaurantDashboard.css";

const quickActions = [
  { to: "/restaurant/menu", icon: UtensilsCrossed, label: "Manage Menu", desc: "Add, edit or remove food items" },
  { to: "/restaurant/orders", icon: ClipboardList, label: "View Orders", desc: "See incoming and past orders" },
  { to: "/restaurant/profile", icon: Store, label: "Edit Profile", desc: "Update restaurant information" },
];

export default function RestaurantDashboard() {
  const { restaurant } = useRestaurantData();
  const { orders } = useOrders();

  const restaurantOrders = useMemo(
    () => orders.filter((o) => o.restaurantId === restaurant?.id),
    [orders, restaurant]
  );

  const stats = useMemo(() => {
    const pending = restaurantOrders.filter((o) =>
      ["PLACED", "ACCEPTED", "PREPARING", "READY_FOR_PICKUP", "PICKED_UP", "OUT_FOR_DELIVERY"].includes(o.status)
    ).length;
    const completed = restaurantOrders.filter((o) => o.status === "DELIVERED").length;
    const revenue = restaurantOrders
      .filter((o) => o.status !== "REJECTED" && o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.total, 0);
    return { total: restaurantOrders.length, pending, completed, revenue };
  }, [restaurantOrders]);

  const recent = useMemo(
    () => [...restaurantOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [restaurantOrders]
  );

  return (
    <div className="fade-in">
      <PageHeader title="Restaurant Dashboard" description={`Welcome back, ${currentRestaurantOwner.ownerName}.`} />

      <RestaurantStatusToggle />

      <DashboardStats
        todaysOrders={stats.total}
        pendingOrders={stats.pending}
        completedOrders={stats.completed}
        todaysRevenue={stats.revenue}
      />

      <div className="rdash__quick-actions">
        {quickActions.map((action) => (
          <Link className="rdash__quick-action" to={action.to} key={action.to}>
            <span className="rdash__quick-action-icon">
              <action.icon size={19} strokeWidth={2} />
            </span>
            <span>
              <strong>{action.label}</strong>
              <span>{action.desc}</span>
            </span>
          </Link>
        ))}
      </div>

      <RecentOrders orders={recent} />
    </div>
  );
}
