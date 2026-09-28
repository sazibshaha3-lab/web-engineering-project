import { useState } from "react";
import { Star, Clock } from "lucide-react";
import Modal from "../feedback/Modal";
import BottomSheet from "../common/BottomSheet";
import ImageWithFallback from "../common/ImageWithFallback";
import { Badge } from "../common/Badge";
import Button from "../common/Button";
import FoodCustomization from "./FoodCustomization";
import useMediaQuery from "../../hooks/useMediaQuery";
import { useCart } from "../../context/CartContext";
import { useToast } from "../feedback/ToastContext";
import "./FoodDetails.css";

export default function FoodDetails({ food, restaurant, open, onClose }) {
  const isMobile = useMediaQuery("(max-width: 719px)");
  const { addToCart } = useCart();
  const toast = useToast();
  const [customState, setCustomState] = useState({ quantity: 1, extras: [], customInstructions: "", total: 0 });
  const [adding, setAdding] = useState(false);

  if (!food || !restaurant) return null;

  const canOrder = food.isAvailable && restaurant.isOpen;

  function handleAdd() {
    if (!canOrder || adding) return;
    setAdding(true);

    const result = addToCart({
      foodId: food.id,
      restaurantId: restaurant.id,
      quantity: customState.quantity,
      extras: customState.extras,
      customInstructions: customState.customInstructions,
    });

    setTimeout(() => setAdding(false), 500);

    if (result.success) {
      toast?.showToast(`${food.name} added to cart`, "success");
      onClose();
    } else if (result.reason !== "RESTAURANT_CONFLICT") {
      toast?.showToast(result.message, "error");
    }
    // RESTAURANT_CONFLICT is surfaced globally via <CartConflictDialog />
  }

  const content = (
    <div className="food-details">
      <div className="food-details__media">
        <ImageWithFallback src={food.image} alt={food.name} ratio="16 / 10" />
      </div>

      <div className="food-details__body">
        <div className="food-details__top">
          <div>
            <h2 className="food-details__name">{food.name}</h2>
            <p className="food-details__desc">{food.description}</p>
          </div>
          {food.isAvailable ? (
            <Badge tone="success">Available</Badge>
          ) : (
            <Badge tone="neutral">Currently unavailable</Badge>
          )}
        </div>

        <div className="food-details__stats">
          <span>
            <Star size={14} fill="currentColor" strokeWidth={0} /> {food.rating}
            {food.reviewCount ? ` (${food.reviewCount})` : ""}
          </span>
          {food.preparationTime && (
            <span>
              <Clock size={14} strokeWidth={2} /> {food.preparationTime}
            </span>
          )}
          <span className="food-details__base-price">Base ৳{food.price}</span>
        </div>

        {!restaurant.isOpen && (
          <div className="food-details__notice">
            This restaurant is currently closed. Ordering is unavailable right now, but you can still browse the menu.
          </div>
        )}
        {restaurant.isOpen && !food.isAvailable && (
          <div className="food-details__notice">This item is currently unavailable from this restaurant.</div>
        )}

        {canOrder ? (
          <FoodCustomization food={food} onStateChange={setCustomState} />
        ) : (
          <div className="food-details__disabled-total">
            <span>Price</span>
            <span>৳{food.price}</span>
          </div>
        )}

        <Button
          fullWidth
          size="lg"
          disabled={!canOrder}
          loading={adding}
          onClick={handleAdd}
          style={{ marginTop: "var(--space-2)" }}
        >
          {!restaurant.isOpen
            ? "Restaurant closed"
            : !food.isAvailable
              ? "Currently unavailable"
              : adding
                ? "Adding..."
                : `Add to cart · ৳${customState.total || food.price}`}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <BottomSheet open={open} onClose={onClose} title={food.name}>
        {content}
      </BottomSheet>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={food.name} size="lg">
      {content}
    </Modal>
  );
}
