import { Link, useNavigate } from "react-router-dom";
import { Menu, Bell } from "lucide-react";
import Avatar from "../common/Avatar";
import IconButton from "../common/IconButton";
import { useAdmin } from "../../context/AdminContext";
import "./AdminHeader.css";

export default function AdminHeader({ onMenuClick, title, adminName }) {
  const navigate = useNavigate();
  const { stats } = useAdmin();
  const alertCount = stats.pendingRestaurants + stats.pendingRiders;

  return (
    <header className="aheader">
      <div className="aheader__left">
        <button className="aheader__menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <div className="aheader__identity">
          <p className="aheader__title">{title}</p>
          <span className="aheader__subtitle">Signed in as {adminName}</span>
        </div>
      </div>

      <div className="aheader__right">
        <IconButton
          icon={Bell}
          label={`${alertCount} pending approvals`}
          variant="surface"
          badge={alertCount || undefined}
          onClick={() => navigate("/admin/restaurants")}
        />
        <Link to="/admin/profile">
          <Avatar name={adminName} size="sm" />
        </Link>
      </div>
    </header>
  );
}
