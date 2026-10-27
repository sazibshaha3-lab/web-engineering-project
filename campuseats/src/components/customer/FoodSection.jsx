import SectionHeader from "../common/SectionHeader";
import FoodCard from "../cards/FoodCard";
import { useCart } from "../../context/CartContext";
import { useRestaurantData } from "../../context/RestaurantContext";
import { useToast } from "../feedback/ToastContext";

export default function FoodSection({ title, description, foods, linkTo, linkLabel }) {
  const { addToCart, getItemQuantity } = useCart();
  const { restaurants } = useRestaurantData();
  const toast = useToast();

  function handleQuickAdd(food) {
    const result = addToCart({
      foodId: food.id,
      restaurantId: food.restaurantId,
      quantity: 1,
    });

    if (result.success) {
      toast?.showToast(`${food.name} added to cart`, "success");
    } else if (result.reason !== "RESTAURANT_CONFLICT") {
      toast?.showToast(result.message, "error");
    }
    // A restaurant conflict is handled by the shared CartConflictDialog.
  }

  return (
    <section className="food-section">
      <SectionHeader title={title} description={description} linkTo={linkTo} linkLabel={linkLabel} />
      <div className="grid grid--foods">
        {foods.map((f) => (
          <FoodCard
            key={f.id}
            food={f}
            onQuickAdd={handleQuickAdd}
            quantityInCart={getItemQuantity(f.id)}
            disabled={!restaurants.some((restaurant) => restaurant.id === f.restaurantId)}
          />
        ))}
      </div>
    </section>
  );
}
