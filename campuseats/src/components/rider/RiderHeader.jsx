import { Link, useNavigate } from "react-router-dom";
import { Menu, Bell } from "lucide-react";
import Avatar from "../common/Avatar";
import IconButton from "../common/IconButton";
import { useRider } from "../../context/RiderContext";
import "./RiderHeader.css";

export default function RiderHeader({ onMenuClick }) {
  const navigate = useNavigate();
  const { rider, isAvailable, getAvailableDeliveries } = useRider();
  const requestCount = getAvailableDeliveries().length;

  return (
    <header className="rheader2">
      <div className="rheader2__left">
        <button className="rheader2__menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <div className="rheader2__identity">
          <p className="rheader2__name">{rider.name}</p>
          <span className={`rheader2__status rheader2__status--${isAvailable ? "on" : "off"}`}>
            <span className="rheader2__status-dot" />
            {isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>
      </div>

      <div className="rheader2__right">
        <IconButton
          icon={Bell}
          label={`${requestCount} delivery requests`}
          variant="surface"
          badge={requestCount || undefined}
          onClick={() => navigate("/rider/deliveries")}
        />
        <Link to="/rider/profile">
          <Avatar name={rider.name} size="sm" />
        </Link>
      </div>
    </header>
  );
}
