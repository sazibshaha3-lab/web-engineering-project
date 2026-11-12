import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu, Bell } from "lucide-react";
import ImageWithFallback from "../common/ImageWithFallback";
import IconButton from "../common/IconButton";
import Avatar from "../common/Avatar";
import { useRestaurantData } from "../../context/RestaurantContext";
import { useOrders } from "../../context/OrderContext";
import { useToast } from "../feedback/ToastContext";
import api from "../../services/api";
import "./RestaurantHeader.css";

export default function RestaurantHeader({ onMenuClick }) {
  const navigate = useNavigate();
  const { restaurant, isOpen } = useRestaurantData();
  const { orders, ordersLoading } = useOrders();
  const toast = useToast();
  const knownPlacedOrders = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const newOrderCount = orders.filter(
    (o) => String(o.restaurantId) === String(restaurant?.id) && o.status === "PLACED"
  ).length;
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  useEffect(() => {
    if (!restaurant?.id) return undefined;

    let active = true;
    const loadNotifications = async () => {
      try {
        const { data } = await api.get("/owner/notifications");
        if (active) setNotifications(data);
      } catch {
        // The order list remains available if this inbox cannot be refreshed.
      }
    };

    loadNotifications();
    const timer = window.setInterval(loadNotifications, 10000);
    const onVisibility = () => {
      if (!document.hidden) loadNotifications();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [restaurant?.id]);

  useEffect(() => {
    if (ordersLoading || !restaurant?.id) return;

    const placedOrders = orders.filter(
      (order) => String(order.restaurantId) === String(restaurant.id) && order.status === "PLACED"
    );
    const currentIds = new Set(placedOrders.map((order) => order.id));

    if (knownPlacedOrders.current) {
      for (const order of placedOrders) {
        if (!knownPlacedOrders.current.has(order.id)) {
          toast?.showToast(`New order ${order.id} received`, "success", {
            label: "View order",
            onClick: () => navigate(`/restaurant/orders/${order.id}`),
          });
        }
      }
    }

    knownPlacedOrders.current = currentIds;
  }, [orders, ordersLoading, restaurant?.id, toast?.showToast, navigate]);

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
          label={`${unreadCount || newOrderCount} order notifications`}
          variant="surface"
          badge={unreadCount || newOrderCount || undefined}
          aria-expanded={notificationsOpen}
          aria-controls="restaurant-notification-inbox"
          onClick={() => setNotificationsOpen((open) => !open)}
        />
        {notificationsOpen && (
          <section className="rheader__notification-inbox" id="restaurant-notification-inbox" aria-label="Order notifications">
            <div className="rheader__notification-heading">
              <strong>Order notifications</strong>
              <button type="button" onClick={() => navigate("/restaurant/orders")}>All orders</button>
            </div>
            {notifications.length ? (
              <ul>
                {notifications.map((notification) => {
                  const orderNumber = notification.data?.orderNumber;
                  return (
                    <li key={notification.id}>
                      <button
                        type="button"
                        className={`rheader__notification${notification.readAt ? " is-read" : ""}`}
                        onClick={async () => {
                          if (!notification.readAt) {
                            try {
                              await api.patch(`/owner/notifications/${notification.id}/read`);
                              setNotifications((current) => current.map((item) =>
                                item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item
                              ));
                            } catch {
                              // Navigation still works; the notification will remain unread if saving fails.
                            }
                          }
                          setNotificationsOpen(false);
                          navigate(`/restaurant/orders/${orderNumber}`);
                        }}
                      >
                        <span className="rheader__notification-title">New order {orderNumber} received</span>
                        <span className="rheader__notification-meta">
                          BDT {Number(notification.data?.orderTotal || 0).toFixed(2)}
                          {notification.createdAt ? ` · ${new Date(notification.createdAt).toLocaleString()}` : ""}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="rheader__notification-empty">No order notifications yet.</p>
            )}
          </section>
        )}
        <Link to="/restaurant/profile">
          <Avatar name={restaurant?.name || "Restaurant"} size="sm" />
        </Link>
      </div>
    </header>
  );
}
