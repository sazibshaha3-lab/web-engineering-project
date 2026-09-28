import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, ClipboardList, UtensilsCrossed, Store, LogOut } from "lucide-react";
import Logo from "../common/Logo";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../feedback/ToastContext";
import "./RestaurantSidebar.css";

const links = [
  { to: "/restaurant", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/restaurant/orders", label: "Orders", icon: ClipboardList },
  { to: "/restaurant/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/restaurant/profile", label: "Profile", icon: Store },
];

export default function RestaurantSidebar({ open, onClose }) {
  const { logoutMock } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  function handleLogout() {
    logoutMock();
    toast?.showToast("Logged out successfully", "success");
    navigate("/login");
  }

  return (
    <>
      {open && <div className="rsidebar__scrim" onClick={onClose} />}
      <aside className={`rsidebar ${open ? "is-open" : ""}`}>
        <div className="rsidebar__brand">
          <Logo compact />
          <span className="rsidebar__brand-text">CampusEats</span>
        </div>
        <nav className="rsidebar__nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) => `rsidebar__link ${isActive ? "is-active" : ""}`}
            >
              <link.icon size={18} strokeWidth={2} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="rsidebar__footer">
          <button className="rsidebar__logout" onClick={handleLogout}>
            <LogOut size={18} strokeWidth={2} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
