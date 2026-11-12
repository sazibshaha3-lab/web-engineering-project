import {
  ArrowUp,
  Check,
  ChevronRight,
  HelpCircle,
  Palette,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useTheme } from "../../context/ThemeContext";
import "./FloatingActions.css";

export default function FloatingActions() {
  const { totalItems } = useCart();
  const { theme, setTheme, themes } = useTheme();
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(() =>
    typeof window === "undefined" || !window.matchMedia("(max-width: 640px)").matches
  );
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    function onScroll() {
      setShowScrollTop(window.scrollY > 280);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 640px)");
    const syncToViewport = (event) => setActionsOpen(!event.matches);
    mobileQuery.addEventListener("change", syncToViewport);
    return () => mobileQuery.removeEventListener("change", syncToViewport);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCartBump(true);
    const t = setTimeout(() => setCartBump(false), 550);
    return () => clearTimeout(t);
  }, [totalItems]);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <nav className="floating-actions" aria-label="Quick actions">
      {!actionsOpen ? (
        <button
          className="floating-actions__fab"
          type="button"
          aria-label="Open quick actions"
          onClick={() => setActionsOpen(true)}
        >
          <Sparkles size={20} />
          {totalItems > 0 && <span className="floating-actions__fab-badge" />}
          <span className="floating-actions__label">Quick Menu</span>
        </button>
      ) : (
        <div className="floating-actions__dock">
          {/* Scroll to Top (Only shown when scrolled down) */}
          {showScrollTop && (
            <button
              className="floating-actions__item"
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
            >
              <span className="floating-actions__icon">
                <ArrowUp size={19} />
              </span>
              <span className="floating-actions__label">Back to top</span>
            </button>
          )}

          {/* Browse Restaurants */}
          <Link
            className="floating-actions__item"
            to="/customer/restaurants"
            aria-label="Browse restaurants"
          >
            <span className="floating-actions__icon">
              <Store size={19} />
            </span>
            <span className="floating-actions__label">Browse food</span>
          </Link>

          {/* Customer Cart */}
          <Link
            className={`floating-actions__item floating-actions__item--cart ${
              totalItems > 0 ? "has-items" : ""
            } ${cartBump ? "is-bumping" : ""}`}
            to="/customer/cart"
            aria-label={`Cart${totalItems ? `, ${totalItems} items` : ""}`}
          >
            <span className="floating-actions__icon">
              <ShoppingBag size={19} />
              {totalItems > 0 && (
                <span className={`floating-actions__count ${cartBump ? "is-bumping" : ""}`}>
                  {totalItems}
                </span>
              )}
            </span>
            <span className="floating-actions__label">
              {totalItems > 0 ? `Cart (${totalItems})` : "Your Cart"}
            </span>
          </Link>

          {/* Help & Support */}
          <Link
            className="floating-actions__item"
            to="/help"
            aria-label="Help & support"
          >
            <span className="floating-actions__icon">
              <HelpCircle size={19} />
            </span>
            <span className="floating-actions__label">Help & Support</span>
          </Link>

          {/* Theme Color Picker */}
          <div className="floating-actions__theme-wrap">
            <button
              className={`floating-actions__item ${themePickerOpen ? "is-active" : ""}`}
              type="button"
              aria-label="Choose theme color"
              aria-expanded={themePickerOpen}
              aria-controls="theme-picker"
              onClick={() => setThemePickerOpen((open) => !open)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setThemePickerOpen(false);
              }}
            >
              <span className="floating-actions__icon">
                <Palette size={19} />
              </span>
              <span className="floating-actions__label">Theme color</span>
            </button>

            {themePickerOpen && (
              <div
                className="floating-actions__theme-menu"
                id="theme-picker"
                role="group"
                aria-label="Choose a theme color"
              >
                <div className="floating-actions__theme-title">Theme Color</div>
                {themes.map((option) => (
                  <button
                    className="floating-actions__theme-option"
                    key={option.id}
                    type="button"
                    aria-pressed={theme === option.id}
                    onClick={() => {
                      setTheme(option.id);
                      setThemePickerOpen(false);
                    }}
                  >
                    <span
                      className="floating-actions__swatch"
                      style={{ "--swatch-color": option.color }}
                    />
                    <span>{option.label}</span>
                    {theme === option.id && <Check size={15} aria-hidden="true" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="floating-actions__divider" />

          {/* Collapse Button */}
          <button
            className="floating-actions__item floating-actions__collapse"
            type="button"
            aria-label="Minimize actions"
            onClick={() => {
              setActionsOpen(false);
              setThemePickerOpen(false);
            }}
          >
            <ChevronRight size={17} />
            <span className="floating-actions__label">Collapse</span>
          </button>
        </div>
      )}
    </nav>
  );
}
