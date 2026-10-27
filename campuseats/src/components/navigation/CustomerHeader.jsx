import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, X, User, ClipboardList, LogOut, LogIn, UserPlus } from "lucide-react";
import Logo from "../common/Logo";
import Avatar from "../common/Avatar";
import Dropdown from "../feedback/Dropdown";
import LocationSelector from "../customer/LocationSelector";
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
  const displayName = user?.name || "";
  const activeCount = getActiveOrders().length;

  const [bump, setBump] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setBump(true);
    const t = setTimeout(() => setBump(false), 550);
    return () => clearTimeout(t);
  }, [totalItems]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 900 && menuOpen) {
        setMenuOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);

  function handleLogout() {
    logoutMock();
    navigate("/login");
  }

  return (
    <header className="customer-header">
      <div className="container customer-header__inner">
        <Link to="/customer" className="customer-header__brand" onClick={() => setMenuOpen(false)}>
          <Logo />
        </Link>

        <div className="customer-header__location">
          <LocationSelector />
        </div>

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

          <Link
            to="/customer/cart"
            className={`customer-header__cart ${bump ? "is-bumping" : ""}`}
            aria-label={`Cart${totalItems ? `, ${totalItems} items` : ""}`}
          >
            <ShoppingBag size={20} strokeWidth={2} className="customer-header__cart-icon" />
            {totalItems > 0 && (
              <span className={`customer-header__cart-count ${bump ? "is-bumping" : ""}`}>{totalItems}</span>
            )}
          </Link>

          {user?.role === "customer" ? (
            <Dropdown
              align="right"
              trigger={(
                <span aria-label={`Account: ${displayName}`} title={displayName} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Avatar name={displayName} size="sm" />
                  <span className="customer-header__user-name">{displayName}</span>
                </span>
              )}
              items={[
                { label: "Profile", icon: User, to: "/customer/profile" },
                { label: "My orders", icon: ClipboardList, to: "/customer/orders" },
                { label: "Log out", icon: LogOut, danger: true, onClick: handleLogout },
              ]}
            />
          ) : (
            <div className="customer-header__guest-auth">
              <Link to="/login" className="customer-header__auth-link">Log in</Link>
            </div>
          )}
        </div>

        {/* Mobile controls: Cart icon + Menu toggle */}
        <div className="customer-header__mobile-controls">
          <Link
            to="/customer/cart"
            className={`customer-header__cart customer-header__cart--mobile ${bump ? "is-bumping" : ""}`}
            aria-label={`Cart${totalItems ? `, ${totalItems} items` : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <ShoppingBag size={20} strokeWidth={2} className="customer-header__cart-icon" />
            {totalItems > 0 && (
              <span className={`customer-header__cart-count ${bump ? "is-bumping" : ""}`}>{totalItems}</span>
            )}
          </Link>

          <button
            className="customer-header__toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`customer-header__mobile ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        {user ? (
          <div className="customer-header__mobile-user">
            <Avatar name={displayName} size="md" />
            <div className="customer-header__mobile-user-info">
              <strong>{displayName}</strong>
              <small>{user.email || "CampusEats Customer"}</small>
            </div>
          </div>
        ) : (
          <div className="customer-header__mobile-auth">
            <Link to="/login" className="btn btn--sm btn--secondary" onClick={() => setMenuOpen(false)}>
              <LogIn size={15} /> Log in
            </Link>
            <Link to="/register" className="btn btn--sm btn--primary" onClick={() => setMenuOpen(false)}>
              <UserPlus size={15} /> Sign up
            </Link>
          </div>
        )}

        {activeOrder && (
          <Link
            to={`/customer/orders/${activeOrder.id}/track`}
            className="customer-header__active-order customer-header__active-order--mobile"
            onClick={() => setMenuOpen(false)}
          >
            <span className="customer-header__active-order-dot" />
            {activeCount} Active Order{activeCount > 1 ? "s" : ""} — Track Now
          </Link>
        )}

        <nav className="customer-header__mobile-nav" aria-label="Mobile Customer Navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `customer-header__mobile-link ${isActive ? "is-active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}

          {user && (
            <>
              <Link
                to="/customer/profile"
                className="customer-header__mobile-link"
                onClick={() => setMenuOpen(false)}
              >
                <User size={18} strokeWidth={2} /> Profile &amp; Addresses
              </Link>
              <button
                type="button"
                className="customer-header__mobile-link customer-header__mobile-link--danger"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
              >
                <LogOut size={18} strokeWidth={2} /> Log out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
