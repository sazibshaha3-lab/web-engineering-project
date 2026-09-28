import { useNavigate, Link } from "react-router-dom";
import { Menu, Bell } from "lucide-react";
import ImageWithFallback from "../common/ImageWithFallback";
import IconButton from "../common/IconButton";
import Avatar from "../common/Avatar";
import { useRestaurantData } from "../../context/RestaurantContext";
import { useOrders } from "../../context/OrderContext";
import "./RestaurantHeader.css";

export default function RestaurantHeader({ onMenuClick }) {
  const navigate = useNavigate();
  const { restaurant, isOpen } = useRestaurantData();
  const { orders } = useOrders();

  const newOrderCount = orders.filter(
    (o) => o.restaurantId === restaurant?.id && o.status === "PLACED"
  ).length;

  return (
    <header className="rheader">
      <div className="rheader__left">
        <button className="rheader__menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <span className="rheader__logo">
          <ImageWithFallback src={restaurant?.logo} alt={restaurant?.name} ratio="1 / 1" />
        </span>
        <div className="rheader__identity">
          <p className="rheader__name">{restaurant?.name}</p>
          <span className={`rheader__status rheader__status--${isOpen ? "open" : "closed"}`}>
            <span className="rheader__status-dot" />
            {isOpen ? "Open" : "Closed"}
          </span>
        </div>
      </div>

      <div className="rheader__right">
        <IconButton
          icon={Bell}
          label={`${newOrderCount} new orders`}
          variant="surface"
          badge={newOrderCount || undefined}
          onClick={() => navigate("/restaurant/orders")}
        />
        <Link to="/restaurant/profile">
          <Avatar name={restaurant?.name || "Restaurant"} size="sm" />
        </Link>
      </div>
    </header>
  );
}
