import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../../context/CartContext";
import "./MobileCartBar.css";

export default function MobileCartBar() {
  const { totalItems, subtotal, cartRestaurantName } = useCart();
  const location = useLocation();

  const isCartOrCheckout =
    location.pathname.includes("/cart") ||
    location.pathname.includes("/checkout") ||
    location.pathname.includes("/order-success");

  if (totalItems <= 0 || isCartOrCheckout) return null;

  return (
    <aside className="mobile-cart-bar" aria-label="Cart summary">
      <Link to="/customer/cart" className="mobile-cart-bar__link">
        <div className="mobile-cart-bar__left">
          <span className="mobile-cart-bar__icon-wrap">
            <ShoppingBag size={19} strokeWidth={2.4} />
            <span className="mobile-cart-bar__count">{totalItems}</span>
          </span>
          <div className="mobile-cart-bar__details">
            <span className="mobile-cart-bar__total">৳{subtotal}</span>
            {cartRestaurantName && (
              <span className="mobile-cart-bar__restaurant">{cartRestaurantName}</span>
            )}
          </div>
        </div>

        <div className="mobile-cart-bar__right">
          <span>View Cart</span>
          <ArrowRight size={17} strokeWidth={2.4} />
        </div>
      </Link>
    </aside>
  );
}

