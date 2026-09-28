import { Link } from "react-router-dom";
import { Store, Bike, ClipboardList, CheckCircle2 } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import "./AdminActivity.css";

export default function AdminActivity() {
  const { pendingRestaurantsList, pendingRidersList, recentOrders, recentlyCompletedOrders } = useAdmin();

  const items = [
    ...pendingRestaurantsList.map((r) => ({
      key: `restaurant-${r.id}`,
      icon: Store,
      text: `${r.name} is awaiting restaurant approval`,
      to: `/admin/restaurants/${r.id}`,
    })),
    ...pendingRidersList.map((r) => ({
      key: `rider-${r.id}`,
      icon: Bike,
      text: `${r.name} is awaiting rider approval`,
      to: `/admin/riders/${r.id}`,
    })),
    ...recentOrders.slice(0, 3).map((o) => ({
      key: `order-${o.id}`,
      icon: ClipboardList,
      text: `${o.id} was placed by a customer at ${o.restaurantName}`,
      to: `/admin/orders/${o.id}`,
    })),
    ...recentlyCompletedOrders.slice(0, 2).map((o) => ({
      key: `done-${o.id}`,
      icon: CheckCircle2,
      text: `${o.id} was delivered`,
      to: `/admin/orders/${o.id}`,
    })),
  ];

  if (items.length === 0) {
    return (
      <div className="dashboard-panel admin-activity">
        <h3>Activity</h3>
        <p className="admin-activity__empty">No recent platform activity to show.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-panel admin-activity">
      <h3>Activity</h3>
      <ul className="admin-activity__list">
        {items.map((item) => (
          <li key={item.key}>
            <Link to={item.to} className="admin-activity__row">
              <span className="admin-activity__icon">
                <item.icon size={16} strokeWidth={2} />
              </span>
              <span>{item.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
