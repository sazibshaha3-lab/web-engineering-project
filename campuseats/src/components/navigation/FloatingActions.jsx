import { ArrowLeft, ArrowUp, Check, LifeBuoy, Palette, ShoppingBag, Store } from "lucide-react";
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
  const [cartBump, setCartBump] = useState(false);
  const isFirstRender = useRef(true);

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
    <nav className={`floating-actions${actionsOpen ? " is-open" : " is-closed"}`} aria-label="Quick actions">
      <button
        className="floating-actions__toggle"
        type="button"
        aria-label={actionsOpen ? "Hide quick actions" : "Show quick actions"}
        aria-expanded={actionsOpen}
        onClick={() => {
          setActionsOpen((open) => !open);
          setThemePickerOpen(false);
        }}
      >
        <ArrowLeft size={19} aria-hidden="true" />
      </button>
      <div className="floating-actions__panel" aria-hidden={!actionsOpen} inert={!actionsOpen}>
      <button className="floating-actions__item" type="button" onClick={scrollToTop} aria-label="Back to top">
        <span className="floating-actions__icon"><ArrowUp size={20} /></span>
        <span className="floating-actions__label">Back to top</span>
      </button>
      <a className="floating-actions__item" href="mailto:support@campuseats.app" aria-label="Contact support">
        <span className="floating-actions__icon"><LifeBuoy size={20} /></span>
        <span className="floating-actions__label">Contact support</span>
      </a>
      <Link
        className={`floating-actions__item ${cartBump ? "is-bumping" : ""}`}
        to="/customer/cart"
        aria-label={`Cart${totalItems ? `, ${totalItems} items` : ""}`}
      >
        <span className="floating-actions__icon">
          <ShoppingBag size={20} className={cartBump ? "is-bumping" : ""} />
          {totalItems > 0 && (
            <span className={`floating-actions__count ${cartBump ? "is-bumping" : ""}`}>{totalItems}</span>
          )}
        </span>
        <span className="floating-actions__label">Your cart</span>
      </Link>
      <Link className="floating-actions__item" to="/customer/restaurants" aria-label="Browse restaurants">
        <span className="floating-actions__icon"><Store size={20} /></span>
        <span className="floating-actions__label">Browse restaurants</span>
      </Link>
      <div className="floating-actions__theme-wrap">
        <button
          className="floating-actions__item floating-actions__theme-trigger"
          type="button"
          aria-label="Choose theme color"
          aria-expanded={themePickerOpen}
          aria-controls="theme-picker"
          onClick={() => setThemePickerOpen((open) => !open)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setThemePickerOpen(false);
          }}
        >
          <span className="floating-actions__icon"><Palette size={20} /></span>
          <span className="floating-actions__label">Theme color</span>
        </button>
        {themePickerOpen && (
          <div className="floating-actions__theme-menu" id="theme-picker" role="group" aria-label="Choose a theme color">
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
                <span className="floating-actions__swatch" style={{ "--swatch-color": option.color }} />
                <span>{option.label}</span>
                {theme === option.id && <Check size={16} aria-hidden="true" />}
              </button>
            ))}
          </div>
        )}
      </div>
      </div>
    </nav>
  );
}
