import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Bike, History, UserRound, LogOut } from "lucide-react";
import Logo from "../common/Logo";
import { useAuth } from "../../context/AuthContext";
import { useRider } from "../../context/RiderContext";
import { useToast } from "../feedback/ToastContext";
import "./RiderSidebar.css";

export default function RiderSidebar({ open, onClose }) {
  const { logoutMock } = useAuth();
  const { getAvailableDeliveries } = useRider();
  const toast = useToast();
  const navigate = useNavigate();

  const requestCount = getAvailableDeliveries().length;

  const links = [
    { to: "/rider", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/rider/deliveries", label: "Deliveries", icon: Bike, badge: requestCount },
    { to: "/rider/history", label: "History", icon: History },
    { to: "/rider/profile", label: "Profile", icon: UserRound },
  ];

  function handleLogout() {
    logoutMock();
    toast?.showToast("Logged out successfully", "success");
    navigate("/login");
  }

  return (
    <>
      {open && <div className="rsidebar2__scrim" onClick={onClose} />}
      <aside className={`rsidebar2 ${open ? "is-open" : ""}`}>
        <div className="rsidebar2__brand">
          <Logo compact />
          <span className="rsidebar2__brand-text">CampusEats</span>
        </div>
        <nav className="rsidebar2__nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) => `rsidebar2__link ${isActive ? "is-active" : ""}`}
            >
              <link.icon size={18} strokeWidth={2} />
              <span>{link.label}</span>
              {!!link.badge && <span className="rsidebar2__badge">{link.badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="rsidebar2__footer">
          <button className="rsidebar2__logout" onClick={handleLogout}>
            <LogOut size={18} strokeWidth={2} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
