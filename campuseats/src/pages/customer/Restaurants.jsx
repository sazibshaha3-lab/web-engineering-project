import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, SearchX, ToggleLeft, ToggleRight } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import CustomerSearch from "../../components/customer/CustomerSearch";
import LocationSelector from "../../components/customer/LocationSelector";
import Select from "../../components/forms/Select";
import { SkeletonCard } from "../../components/common/SkeletonLoader";
import EmptyState from "../../components/common/EmptyState";
import RestaurantCard from "../../components/cards/RestaurantCard";
import { categories } from "../../data/categories";
import { useRestaurantData } from "../../context/RestaurantContext";
import { sortOptions, ratingOptions, deliveryTimeOptions, sortRestaurants, avgDeliveryMinutes } from "../../utils/restaurantFilters";
import "./Restaurants.css";

export default function Restaurants() {
  const { restaurants, foods, loading: dataLoading } = useRestaurantData();
  const [params, setParams] = useSearchParams();
  const activeCategory = params.get("category") || "all";
  const query = params.get("q") || "";
  const location = params.get("location") || "";
  const [loading, setLoading] = useState(true);
  const [openOnly, setOpenOnly] = useState(false);
  const [minRating, setMinRating] = useState("any");
  const [maxDeliveryTime, setMaxDeliveryTime] = useState("any");
  const [sortBy, setSortBy] = useState("recommended");

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [activeCategory]);

  const isLoading = loading || dataLoading;

  const filtered = useMemo(() => {
    let list = restaurants.filter((r) => {
      const restaurantFoods = foods.filter((food) => food.restaurantId === String(r.id));
      const categoryName = categories.find((c) => c.id === activeCategory)?.name.toLowerCase();
      const matchesCategory =
        activeCategory === "all" ||
        r.category.toLowerCase().includes(activeCategory.toLowerCase()) ||
        categoryName === r.category.toLowerCase() ||
        restaurantFoods.some((food) => food.category?.toLowerCase() === activeCategory);
      const normalizedQuery = query.trim().toLowerCase();
      const matchesQuery = !normalizedQuery ||
        [r.name, r.category, r.description, r.address].some((value) => value?.toLowerCase().includes(normalizedQuery)) ||
        restaurantFoods.some((food) => [food.name, food.description, food.category].some((value) => value?.toLowerCase().includes(normalizedQuery)));
      const matchesLocation = !location.trim() || r.address?.toLowerCase().includes(location.trim().toLowerCase());
      const matchesOpen = !openOnly || r.isOpen;
      const matchesRating = minRating === "any" || r.rating >= parseFloat(minRating);
      const matchesTime = maxDeliveryTime === "any" || avgDeliveryMinutes(r.deliveryTime) <= parseFloat(maxDeliveryTime);
      return matchesCategory && matchesQuery && matchesLocation && matchesOpen && matchesRating && matchesTime;
    });
    return sortRestaurants(list, sortBy);
  }, [activeCategory, query, location, openOnly, minRating, maxDeliveryTime, sortBy, restaurants, foods]);

  const filtersActive = query || location || openOnly || minRating !== "any" || maxDeliveryTime !== "any" || activeCategory !== "all";

  function updateSearchParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  return (
    <div className="fade-in">
      <PageHeader
        icon={SlidersHorizontal}
        title="Explore restaurants"
        description="Every kitchen currently delivering to your saved locations."
        actions={<LocationSelector compact />}
      />

      <div style={{ maxWidth: 460, marginBottom: "var(--space-5)" }}>
        <CustomerSearch value={query} onChange={(value) => updateSearchParam("q", value)} placeholder="Search food, restaurants or cuisines" />
      </div>

      <div className="restaurants-page__filters">
        <button
          className={`restaurants-page__chip ${activeCategory === "all" ? "is-active" : ""}`}
          onClick={() => updateSearchParam("category", "")}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`restaurants-page__chip ${activeCategory === cat.id ? "is-active" : ""}`}
            onClick={() => updateSearchParam("category", cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="restaurants-page__toolbar">
        <button
          className={`restaurants-page__toggle ${openOnly ? "is-active" : ""}`}
          onClick={() => setOpenOnly((v) => !v)}
        >
          {openOnly ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          Open now
        </button>

        <div className="restaurants-page__selects">
          <Select
            options={ratingOptions}
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            aria-label="Filter by rating"
          />
          <Select
            options={deliveryTimeOptions}
            value={maxDeliveryTime}
            onChange={(e) => setMaxDeliveryTime(e.target.value)}
            aria-label="Filter by delivery time"
          />
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort restaurants"
          />
        </div>
      </div>

      <p className="restaurants-page__count">{filtered.length} restaurant{filtered.length === 1 ? "" : "s"} found</p>

      {isLoading ? (
        <div className="grid grid--restaurants">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No tasty matches found"
          description={filtersActive ? "Try adjusting your filters or search term." : "No restaurants are available right now."}
        />
      ) : (
        <div className="grid grid--restaurants">
          {filtered.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      )}
    </div>
  );
}
