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
  const { restaurants } = useRestaurantData();
  const [params, setParams] = useSearchParams();
  const activeCategory = params.get("category") || "all";
  const [query, setQuery] = useState("");
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

  const filtered = useMemo(() => {
    let list = restaurants.filter((r) => {
      const matchesCategory =
        activeCategory === "all" ||
        r.category.toLowerCase().includes(activeCategory.toLowerCase()) ||
        categories.find((c) => c.id === activeCategory)?.name.toLowerCase() === r.category.toLowerCase();
      const matchesQuery = r.name.toLowerCase().includes(query.toLowerCase());
      const matchesOpen = !openOnly || r.isOpen;
      const matchesRating = minRating === "any" || r.rating >= parseFloat(minRating);
      const matchesTime = maxDeliveryTime === "any" || avgDeliveryMinutes(r.deliveryTime) <= parseFloat(maxDeliveryTime);
      return matchesCategory && matchesQuery && matchesOpen && matchesRating && matchesTime;
    });
    return sortRestaurants(list, sortBy);
  }, [activeCategory, query, openOnly, minRating, maxDeliveryTime, sortBy, restaurants]);

  const filtersActive = query || openOnly || minRating !== "any" || maxDeliveryTime !== "any" || activeCategory !== "all";

  return (
    <div className="fade-in">
      <PageHeader
        icon={SlidersHorizontal}
        title="Explore restaurants"
        description="Every kitchen currently delivering to your saved locations."
        actions={<LocationSelector compact />}
      />

      <div style={{ maxWidth: 460, marginBottom: "var(--space-5)" }}>
        <CustomerSearch value={query} onChange={setQuery} placeholder="Search restaurants or cuisines" />
      </div>

      <div className="restaurants-page__filters">
        <button
          className={`restaurants-page__chip ${activeCategory === "all" ? "is-active" : ""}`}
          onClick={() => setParams({})}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`restaurants-page__chip ${activeCategory === cat.id ? "is-active" : ""}`}
            onClick={() => setParams({ category: cat.id })}
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

      {loading ? (
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
