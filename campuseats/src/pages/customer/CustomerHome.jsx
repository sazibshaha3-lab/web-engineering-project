import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Bookmark, PackageSearch } from "lucide-react";
import CustomerSearch from "../../components/customer/CustomerSearch";
import CategoryScroller from "../../components/customer/CategoryScroller";
import RestaurantSection from "../../components/customer/RestaurantSection";
import FoodSection from "../../components/customer/FoodSection";
import { categories } from "../../data/categories";
import { currentCustomer } from "../../data/users";
import { useAuth } from "../../context/AuthContext";
import { useRestaurantData } from "../../context/RestaurantContext";
import "./CustomerHome.css";

const quickActions = [
  { icon: RotateCcw, label: "Reorder", desc: "Order your last meal again" },
  { icon: Bookmark, label: "Saved places", desc: "Manage your delivery addresses" },
  { icon: PackageSearch, label: "Track order", desc: "See where your food is" },
];

export default function CustomerHome() {
  const { user } = useAuth();
  const { restaurants, foods } = useRestaurantData();
  const [query, setQuery] = useState("");
  const firstName = (user?.name || currentCustomer.name).split(" ")[0];

  const filteredRestaurants = useMemo(() => {
    if (!query.trim()) return restaurants.slice(0, 4);
    return restaurants.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));
  }, [query, restaurants]);

  return (
    <div className="fade-in">
      <div className="customer-home__hero">
        <h1>{user ? `Hi, ${firstName} 👋` : `Good to see you, ${firstName}`}</h1>
        <p>What are you craving today? Search restaurants and dishes near your saved locations.</p>
        <CustomerSearch value={query} onChange={setQuery} size="md" />
      </div>

      <section className="customer-home__section customer-home__quick-actions">
        {quickActions.map((action) => (
          <button className="quick-action" key={action.label}>
            <span className="quick-action__icon">
              <action.icon size={18} strokeWidth={2} />
            </span>
            <span>
              <strong>{action.label}</strong>
              <span>{action.desc}</span>
            </span>
          </button>
        ))}
      </section>

      <section className="customer-home__section">
        <h3 className="customer-home__section-title">Browse by category</h3>
        <CategoryScroller categories={categories} />
      </section>

      {query.trim() ? (
        filteredRestaurants.length > 0 ? (
          <RestaurantSection
            title={`Results for "${query}"`}
            restaurants={filteredRestaurants}
            linkTo="/customer/restaurants"
            linkLabel="See all restaurants"
          />
        ) : (
          <div className="customer-home__no-results">
            <p>No tasty matches found for "{query}".</p>
            <Link to="/customer/restaurants">Browse all restaurants</Link>
          </div>
        )
      ) : (
        <>
          <RestaurantSection
            title="Recommended for you"
            description="Picked based on what's popular near your saved locations."
            restaurants={restaurants.slice(2, 6)}
            linkTo="/customer/restaurants"
            tone="highlight"
          />

          <RestaurantSection
            title="Nearby restaurants"
            restaurants={restaurants.slice(0, 4)}
            linkTo="/customer/restaurants"
          />

          <FoodSection
            title="Popular near you"
            foods={foods.slice(0, 4)}
            linkTo="/customer/restaurants"
          />
        </>
      )}
    </div>
  );
}
