import { useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import EmptyCart from "../../components/cart/EmptyCart";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../components/feedback/ToastContext";
import { useRestaurantData } from "../../context/RestaurantContext";
import { validateRestaurantFoodRelation } from "../../utils/dataValidation";
import "./Cart.css";

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, addToCart, subtotal, cartRestaurantId } = useCart();
  const { restaurants, foods } = useRestaurantData();
  const toast = useToast();
  const lastRemovedRef = useRef(null);

  const restaurant = useMemo(
    () => restaurants.find((r) => r.id === cartRestaurantId) || null,
    [cartRestaurantId, restaurants]
  );

  const invalidItems = useMemo(() => {
    if (!restaurant) return [];
    return items.filter((item) => {
      const result = validateRestaurantFoodRelation(restaurants, foods, item.restaurantId, item.foodId);
      return !result.valid || !result.food.isAvailable;
    });
  }, [items, restaurant, restaurants, foods]);

  const deliveryFee = items.length ? restaurant?.deliveryFee || 0 : 0;
  const meetsMinimum = !restaurant || subtotal >= (restaurant.minimumOrder || 0);
  const amountNeeded = restaurant ? Math.max(0, restaurant.minimumOrder - subtotal) : 0;
  const hasBlockingIssues = invalidItems.length > 0 || (restaurant && !restaurant.isOpen);

  function handleRemove(item) {
    lastRemovedRef.current = item;
    removeFromCart(item.id);
    toast?.showToast("Item removed from cart", "info", {
      label: "Undo",
      onClick: () => {
        const removed = lastRemovedRef.current;
        if (!removed) return;
        addToCart({
          foodId: removed.foodId,
          restaurantId: removed.restaurantId,
          quantity: removed.quantity,
          extras: removed.extras,
          customInstructions: removed.customInstructions,
        });
      },
    });
  }

  function handleCheckout() {
    if (hasBlockingIssues || !meetsMinimum) return;
    navigate("/customer/checkout");
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="fade-in">
      <div className="cart-page__header">
        <Link to="/customer/restaurants" className="cart-page__back">
          <ArrowLeft size={16} strokeWidth={2} /> Back to restaurants
        </Link>
        <span className="cart-page__count">{items.length} item{items.length > 1 ? "s" : ""}</span>
      </div>

      {invalidItems.length > 0 && (
        <div className="cart-page__invalid-banner">
          <AlertTriangle size={20} strokeWidth={2} style={{ flexShrink: 0 }} />
          <div>
            <strong>Some items need your attention</strong>
            <p>One or more items are no longer available. Please review your cart before continuing.</p>
          </div>
        </div>
      )}

      <div className="cart-page">
        <div className="cart-page__items">
          {restaurant && (
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              Ordering from <strong style={{ color: "var(--color-text)" }}>{restaurant.name}</strong>
            </p>
          )}
          {items.map((item) => (
            <CartItem key={item.id} item={item} onUpdateQuantity={updateQuantity} onRemove={handleRemove} />
          ))}
        </div>

        <div className="cart-page__summary">
          <CartSummary
            restaurant={restaurant}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            meetsMinimum={meetsMinimum}
            amountNeeded={amountNeeded}
            onCheckout={handleCheckout}
            disabled={hasBlockingIssues}
          />
        </div>
      </div>
    </div>
  );
}
