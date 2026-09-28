import { Link } from "react-router-dom";
import { ClipboardList, Store, Bike, Users } from "lucide-react";
import "./AdminQuickActions.css";

const actions = [
  { to: "/admin/orders", icon: ClipboardList, label: "View Orders", desc: "See every order across CampusEats" },
  { to: "/admin/restaurants", icon: Store, label: "Manage Restaurants", desc: "Approvals, blocks and details" },
  { to: "/admin/riders", icon: Bike, label: "Manage Riders", desc: "Approvals, blocks and details" },
  { to: "/admin/customers", icon: Users, label: "Manage Customers", desc: "Accounts and order history" },
];

export default function AdminQuickActions() {
  return (
    <div className="admin-quick-actions">
      {actions.map((action) => (
        <Link className="admin-quick-action" to={action.to} key={action.to}>
          <span className="admin-quick-action__icon">
            <action.icon size={20} strokeWidth={2} />
          </span>
          <div>
            <p className="admin-quick-action__label">{action.label}</p>
            <p className="admin-quick-action__desc">{action.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
