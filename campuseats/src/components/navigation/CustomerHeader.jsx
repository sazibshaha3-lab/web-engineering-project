import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, X } from "lucide-react";
import Logo from "../common/Logo";
import Avatar from "../common/Avatar";
import Dropdown from "../feedback/Dropdown";
import LocationSelector from "../customer/LocationSelector";
import { User, ClipboardList, LogOut } from "lucide-react";
import { currentCustomer } from "../../data/users";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useOrders } from "../../context/OrderContext";
import "./CustomerHeader.css";

const links = [
  { to: "/customer", label: "Discover", end: true },
  { to: "/customer/restaurants", label: "Restaurants" },
  { to: "/customer/orders", label: "Orders" },
];

export default function CustomerHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logoutMock } = useAuth();
  const { totalItems } = useCart();
  const { activeOrder, getActiveOrders } = useOrders();
  const displayName = user?.name || currentCustomer.name;
  const activeCount = getActiveOrders().length;

  const [bump, setBump] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setBump(true);
    const t = setTimeout(() => setBump(false), 320);
    return () => clearTimeout(t);
  }, [totalItems]);

  function handleLogout() {
    logoutMock();
    navigate("/");
  }

  return (
    <header className="customer-header">
      <div className="container customer-header__inner">
        <Link to="/customer" className="customer-header__brand">
          <Logo />
        </Link>

        <LocationSelector />

        <nav className="customer-header__links" aria-label="Customer">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `customer-header__link ${isActive ? "is-active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="customer-header__actions">
          {activeOrder && (
            <Link
              to={`/customer/orders/${activeOrder.id}/track`}
              className="customer-header__active-order"
              aria-label={`${activeCount} active order${activeCount > 1 ? "s" : ""} — track order`}
            >
              <span className="customer-header__active-order-dot" />
              {activeCount} Active Order{activeCount > 1 ? "s" : ""}
            </Link>
          )}
          <Link to="/customer/cart" className="customer-header__cart" aria-label="Cart">
            <ShoppingBag size={20} strokeWidth={2} />
            {totalItems > 0 && (
              <span className={`customer-header__cart-count ${bump ? "is-bumping" : ""}`}>{totalItems}</span>
            )}
          </Link>
          <Dropdown
            align="right"
            trigger={<Avatar name={displayName} size="sm" />}
            items={[
              { label: "Profile", icon: User, to: "/customer/profile" },
              { label: "My orders", icon: ClipboardList, to: "/customer/orders" },
              { label: "Log out", icon: LogOut, danger: true, onClick: handleLogout },
            ]}
          />
        </div>

        <button className="customer-header__toggle" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className={`customer-header__mobile ${menuOpen ? "is-open" : ""}`}>
        {activeOrder && (
          <Link
            to={`/customer/orders/${activeOrder.id}/track`}
            className="customer-header__active-order customer-header__active-order--mobile"
            onClick={() => setMenuOpen(false)}
          >
            <span className="customer-header__active-order-dot" />
            {activeCount} Active Order{activeCount > 1 ? "s" : ""}
          </Link>
        )}
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setMenuOpen(false)}>
            {link.label}
          </NavLink>
        ))}
      </div>
    </header>
  );
}
