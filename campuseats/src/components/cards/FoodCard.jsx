import { Plus, Star, Flame, Clock } from "lucide-react";
import ImageWithFallback from "../common/ImageWithFallback";
import "./FoodCard.css";

export default function FoodCard({ food, onOpenDetails, onQuickAdd, disabled, quantityInCart = 0, compact = false }) {
  const { name, restaurantName, description, image, price, rating, preparationTime, isAvailable, isPopular } = food;
  const unavailable = !isAvailable;
  const addDisabled = unavailable || disabled;

  function handleCardClick() {
    onOpenDetails?.(food);
  }

  function handleCardKeyDown(e) {
    if ((e.key === "Enter" || e.key === " ") && onOpenDetails) {
      e.preventDefault();
      onOpenDetails(food);
    }
  }

  function handleAddClick(e) {
    e.stopPropagation();
    if (addDisabled) return;
    onQuickAdd?.(food);
  }

  return (
    <div
      className={`food-card ${unavailable ? "food-card--unavailable" : ""} ${onOpenDetails ? "food-card--clickable" : ""}`}
      onClick={onOpenDetails ? handleCardClick : undefined}
      onKeyDown={onOpenDetails ? handleCardKeyDown : undefined}
      role={onOpenDetails ? "button" : undefined}
      tabIndex={onOpenDetails ? 0 : undefined}
    >
      <div className="food-card__media">
        <ImageWithFallback src={image} alt={name} ratio="4 / 3" />
        {isPopular && !unavailable && (
          <span className="food-card__popular">
            <Flame size={11} strokeWidth={2.4} /> Popular
          </span>
        )}
        {unavailable && <span className="food-card__sold-out">Currently unavailable</span>}
      </div>
      <div className="food-card__body">
        <h4 className="food-card__name">{name}</h4>
        {compact ? (
          <p className="food-card__restaurant">{restaurantName}</p>
        ) : (
          description && <p className="food-card__desc">{description}</p>
        )}
        <div className="food-card__footer">
          <span className="food-card__price">৳{price}</span>
          <span className="food-card__meta">
            <span className="food-card__rating">
              <Star size={12} fill="currentColor" strokeWidth={0} />
              {rating}
            </span>
            {preparationTime && (
              <span className="food-card__prep">
                <Clock size={11} strokeWidth={2} /> {preparationTime}
              </span>
            )}
          </span>
        </div>
      </div>
      <button className="food-card__add" disabled={addDisabled} onClick={handleAddClick} aria-label={`Add ${name}`}>
        {quantityInCart > 0 ? quantityInCart : <Plus size={18} strokeWidth={2.4} />}
      </button>
    </div>
  );
}
