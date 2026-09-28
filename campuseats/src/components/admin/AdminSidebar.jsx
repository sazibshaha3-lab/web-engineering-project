import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Users, Store, Bike, UserCog, LogOut } from "lucide-react";
import Logo from "../common/Logo";
import { useAuth } from "../../context/AuthContext";
import { useAdmin } from "../../context/AdminContext";
import { useToast } from "../feedback/ToastContext";
import "./AdminSidebar.css";

export default function AdminSidebar({ open, onClose }) {
  const { logoutMock } = useAuth();
  const { stats } = useAdmin();
  const toast = useToast();
  const navigate = useNavigate();

  const links = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/orders", label: "Orders", icon: ClipboardList },
    { to: "/admin/customers", label: "Customers", icon: Users },
    { to: "/admin/restaurants", label: "Restaurants", icon: Store, badge: stats.pendingRestaurants },
    { to: "/admin/riders", label: "Riders", icon: Bike, badge: stats.pendingRiders },
    { to: "/admin/profile", label: "Profile", icon: UserCog },
  ];

  function handleLogout() {
    logoutMock();
    toast?.showToast("Logged out successfully", "success");
    navigate("/login");
  }

  return (
    <>
      {open && <div className="asidebar__scrim" onClick={onClose} />}
      <aside className={`asidebar ${open ? "is-open" : ""}`}>
        <div className="asidebar__brand">
          <Logo compact />
          <span className="asidebar__brand-text">CampusEats</span>
        </div>
        <nav className="asidebar__nav" aria-label="Admin">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) => `asidebar__link ${isActive ? "is-active" : ""}`}
            >
              <link.icon size={18} strokeWidth={2} />
              <span>{link.label}</span>
              {!!link.badge && <span className="asidebar__badge">{link.badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="asidebar__footer">
          <button className="asidebar__logout" onClick={handleLogout}>
            <LogOut size={18} strokeWidth={2} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
