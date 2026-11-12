import { useMemo } from "react";
import { Link } from "react-router-dom";
import { UtensilsCrossed, ClipboardList, Store, ArrowUpRight, Sparkles } from "lucide-react";
import DashboardStats from "../../components/restaurant/DashboardStats";
import RestaurantStatusToggle from "../../components/restaurant/RestaurantStatusToggle";
import RecentOrders from "../../components/restaurant/RecentOrders";
import { useRestaurantData } from "../../context/RestaurantContext";
import { useOrders } from "../../context/OrderContext";
import { useAuth } from "../../context/AuthContext";
import "./RestaurantDashboard.css";

const quickActions = [
  { to: "/restaurant/menu", icon: UtensilsCrossed, label: "Manage Menu", desc: "Add, edit or remove food items", tone: "primary" },
  { to: "/restaurant/orders", icon: ClipboardList, label: "View Orders", desc: "See incoming and past orders", tone: "secondary" },
  { to: "/restaurant/profile", icon: Store, label: "Edit Profile", desc: "Update restaurant information", tone: "info" },
];

export default function RestaurantDashboard() {
  const { restaurant } = useRestaurantData();
  const { orders } = useOrders();
  const { user } = useAuth();

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
    <div className="fade-in rdash">
      <div className="rdash-hero">
        <div className="rdash-hero__content">
          <div className="rdash-hero__badge">
            <Sparkles size={14} />
            <span>Restaurant Partner Portal</span>
          </div>
          <h1 className="rdash-hero__title">
            Welcome back, {user?.name || "Partner"} 👋
          </h1>
          <p className="rdash-hero__desc">
            Track live customer orders, update your menu dishes, and keep campus deliveries running smoothly.
          </p>
        </div>
        {restaurant?.name && (
          <div className="rdash-hero__store-card">
            <span className="rdash-hero__store-dot" />
            <div>
              <span className="rdash-hero__store-label">Active Kitchen</span>
              <strong className="rdash-hero__store-title">{restaurant.name}</strong>
            </div>
          </div>
        )}
      </div>

      <RestaurantStatusToggle />

      <DashboardStats
        todaysOrders={stats.total}
        pendingOrders={stats.pending}
        completedOrders={stats.completed}
        todaysRevenue={stats.revenue}
      />

      <div className="rdash__quick-actions">
        {quickActions.map((action) => (
          <Link className={`rdash__quick-action rdash__quick-action--${action.tone}`} to={action.to} key={action.to}>
            <span className={`rdash__quick-action-icon rdash__quick-action-icon--${action.tone}`}>
              <action.icon size={20} strokeWidth={2.2} />
            </span>
            <span className="rdash__quick-action-text">
              <strong>{action.label}</strong>
              <span>{action.desc}</span>
            </span>
            <ArrowUpRight size={18} className="rdash__quick-action-arrow" />
          </Link>
        ))}
      </div>

      <RecentOrders orders={recent} />
    </div>
  );
}
