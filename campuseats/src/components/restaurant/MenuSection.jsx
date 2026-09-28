import FoodCard from "../cards/FoodCard";
import "./MenuSection.css";

export default function MenuSection({ category, foods, onOpenDetails, onQuickAdd, disabled, getItemQuantity }) {
  if (!foods.length) return null;

  return (
    <section className="menu-section" id={`category-${category}`}>
      <div className="menu-section__header">
        <h3 className="menu-section__title">{category}</h3>
        <span className="menu-section__count">({foods.length})</span>
      </div>
      <div className="grid grid--foods">
        {foods.map((food) => (
          <FoodCard
            key={food.id}
            food={food}
            onOpenDetails={onOpenDetails}
            onQuickAdd={onQuickAdd}
            disabled={disabled}
            quantityInCart={getItemQuantity?.(food.id) || 0}
          />
        ))}
      </div>
    </section>
  );
}
