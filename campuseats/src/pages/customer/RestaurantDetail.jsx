import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Flame, SearchX, Store } from "lucide-react";
import { getReviewsByRestaurantId } from "../../data/reviews";
import { findRestaurantById, getFoodsByRestaurantId } from "../../utils/dataValidation";
import { foodSortOptions, matchesFoodSearch, sortFoods, groupFoodsByCategory } from "../../utils/foodFilters";
import { useCart } from "../../context/CartContext";
import { useRestaurantData } from "../../context/RestaurantContext";
import { useToast } from "../../components/feedback/ToastContext";

import RestaurantHero from "../../components/restaurant/RestaurantHero";
import RestaurantInfo from "../../components/restaurant/RestaurantInfo";
import RestaurantCategoryNav from "../../components/restaurant/RestaurantCategoryNav";
import MenuSection from "../../components/restaurant/MenuSection";
import RestaurantReviews from "../../components/restaurant/RestaurantReviews";
import FoodDetails from "../../components/food/FoodDetails";
import FoodCard from "../../components/cards/FoodCard";
import CustomerSearch from "../../components/customer/CustomerSearch";
import Select from "../../components/forms/Select";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import { SkeletonBlock, SkeletonCard } from "../../components/common/SkeletonLoader";
import "./RestaurantDetail.css";

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getItemQuantity } = useCart();
  const { restaurants, foods } = useRestaurantData();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [popularOnly, setPopularOnly] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");
  const [openFood, setOpenFood] = useState(null);

  const restaurant = findRestaurantById(restaurants, id);
  const menu = useMemo(() => getFoodsByRestaurantId(foods, id), [id, foods]);
  const reviews = useMemo(() => (restaurant ? getReviewsByRestaurantId(restaurant.id) : []), [restaurant]);

  useEffect(() => {
    setLoading(true);
    setQuery("");
    setActiveCategory("all");
    setAvailableOnly(false);
    setPopularOnly(false);
    setSortBy("recommended");
    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, [id]);

  const categories = useMemo(() => [...new Set(menu.map((f) => f.category))], [menu]);
  const popularFoods = useMemo(() => menu.filter((f) => f.isPopular), [menu]);

  const filteredFoods = useMemo(() => {
    let list = menu.filter((f) => {
      const matchesCategory = activeCategory === "all" || f.category === activeCategory;
      const matchesQuery = matchesFoodSearch(f, query);
      const matchesAvailable = !availableOnly || f.isAvailable;
      const matchesPopular = !popularOnly || f.isPopular;
      return matchesCategory && matchesQuery && matchesAvailable && matchesPopular;
    });
    return sortFoods(list, sortBy);
  }, [menu, activeCategory, query, availableOnly, popularOnly, sortBy]);

  const groups = useMemo(() => groupFoodsByCategory(filteredFoods), [filteredFoods]);

  function clearSearch() {
    setQuery("");
  }

  function clearFilters() {
    setActiveCategory("all");
    setAvailableOnly(false);
    setPopularOnly(false);
  }

  function handleQuickAdd(food) {
    if (!restaurant) return;
    const result = addToCart({ foodId: food.id, restaurantId: restaurant.id, quantity: 1 });
    if (result.success) {
      toast?.showToast(`${food.name} added to cart`, "success");
    } else if (result.reason !== "RESTAURANT_CONFLICT") {
      toast?.showToast(result.message, "error");
    }
  }

  if (!restaurant) {
    return (
      <ErrorState
        title="Restaurant not found"
        description="This restaurant may no longer be available or the link is invalid."
        onRetry={() => navigate("/customer/restaurants")}
        actionLabel="Browse Restaurants"
        actionIcon={Store}
      />
    );
  }

  return (
    <div className="fade-in">
      {loading ? (
        <>
          <div className="restaurant-detail__hero-skeleton">
            <SkeletonBlock height="260px" radius="0" />
          </div>
          <div className="grid grid--foods" style={{ marginTop: "var(--space-6)" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </>
      ) : (
        <>
          <RestaurantHero restaurant={restaurant} />
          <RestaurantInfo restaurant={restaurant} />

          {popularFoods.length > 0 && (
            <section className="restaurant-detail__popular">
              <h3 className="restaurant-detail__popular-title">
                <Flame size={16} style={{ verticalAlign: "-3px", marginRight: 6, color: "var(--color-primary)" }} />
                Popular at {restaurant.name}
              </h3>
              <div className="grid grid--foods">
                {popularFoods.slice(0, 4).map((food) => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    compact
                    onOpenDetails={setOpenFood}
                    onQuickAdd={handleQuickAdd}
                    disabled={!restaurant.isOpen}
                    quantityInCart={getItemQuantity(food.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {menu.length > 0 && (
            <>
              <div className="restaurant-detail__toolbar">
                <div className="restaurant-detail__toolbar-search">
                  <CustomerSearch value={query} onChange={setQuery} placeholder="Search this menu" size="sm" />
                </div>
                <div className="restaurant-detail__toolbar-controls">
                  <button
                    className={`restaurant-detail__filter-toggle ${availableOnly ? "is-active" : ""}`}
                    onClick={() => setAvailableOnly((v) => !v)}
                  >
                    <CheckCircle2 size={15} strokeWidth={2} /> Available
                  </button>
                  <button
                    className={`restaurant-detail__filter-toggle ${popularOnly ? "is-active" : ""}`}
                    onClick={() => setPopularOnly((v) => !v)}
                  >
                    <Flame size={15} strokeWidth={2} /> Popular
                  </button>
                  <div className="restaurant-detail__sort">
                    <Select
                      options={foodSortOptions}
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      aria-label="Sort menu"
                    />
                  </div>
                </div>
              </div>

              <RestaurantCategoryNav categories={categories} active={activeCategory} onSelect={setActiveCategory} />
            </>
          )}

          {menu.length === 0 ? (
            <EmptyState
              icon={Store}
              title="Menu coming soon"
              description="This restaurant hasn't added any menu items yet."
            />
          ) : filteredFoods.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No dishes found"
              description="Try another search term or remove some filters."
              action={
                <div className="restaurant-detail__empty-actions">
                  {query && (
                    <Button variant="ghost" size="sm" onClick={clearSearch}>
                      Clear Search
                    </Button>
                  )}
                  {(activeCategory !== "all" || availableOnly || popularOnly) && (
                    <Button variant="secondary" size="sm" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              }
            />
          ) : (
            <div className="restaurant-detail__menu" key={`${activeCategory}-${sortBy}-${query}-${availableOnly}-${popularOnly}`}>
              {groups.map((group) => (
                <MenuSection
                  key={group.category}
                  category={group.category}
                  foods={group.foods}
                  onOpenDetails={setOpenFood}
                  onQuickAdd={handleQuickAdd}
                  disabled={!restaurant.isOpen}
                  getItemQuantity={getItemQuantity}
                />
              ))}
            </div>
          )}

          <RestaurantReviews restaurant={restaurant} reviews={reviews} />
        </>
      )}

      <FoodDetails food={openFood} restaurant={restaurant} open={!!openFood} onClose={() => setOpenFood(null)} />
    </div>
  );
}
