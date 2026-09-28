import { createContext, useContext, useMemo, useState } from "react";
import { restaurants as seedRestaurants } from "../data/restaurants";
import { foods as seedFoods } from "../data/foods";

const RestaurantContext = createContext(null);

// The single demo restaurant-owner account (Step 6) manages this restaurant.
// Matches data/users.js -> currentRestaurantOwner ("Campus Grill House").
const MY_RESTAURANT_ID = "r1";

export function RestaurantDataProvider({ children }) {
  // This is the live, mutable product catalog for the whole session —
  // both the customer-facing pages and the restaurant panel read and
  // write through this single context so changes stay in sync everywhere.
  // It also doubles as the Admin's restaurant registry (Step 8): every
  // restaurant — approved, pending, rejected or blocked — lives here,
  // there is no separate "adminRestaurants" list.
  const [allRestaurants, setAllRestaurants] = useState(seedRestaurants);
  const [allFoods, setAllFoods] = useState(seedFoods);

  const restaurant = useMemo(
    () => allRestaurants.find((r) => r.id === MY_RESTAURANT_ID) || null,
    [allRestaurants]
  );

  const menuItems = useMemo(
    () => allFoods.filter((f) => f.restaurantId === MY_RESTAURANT_ID),
    [allFoods]
  );

  const categories = useMemo(
    () => [...new Set(menuItems.map((f) => f.category))],
    [menuItems]
  );

  // Customer-facing catalog: only restaurants Admin has approved and not
  // blocked ever appear for browsing/ordering. Restaurant/Rider/Admin
  // panels that need every restaurant (approved, pending, rejected,
  // blocked) read `allRestaurants` instead.
  const restaurants = useMemo(
    () => allRestaurants.filter((r) => r.approvalStatus === "APPROVED" && !r.blocked),
    [allRestaurants]
  );

  function updateRestaurant(patch) {
    setAllRestaurants((prev) => prev.map((r) => (r.id === MY_RESTAURANT_ID ? { ...r, ...patch } : r)));
  }

  function toggleOpen() {
    setAllRestaurants((prev) =>
      prev.map((r) => (r.id === MY_RESTAURANT_ID ? { ...r, isOpen: !r.isOpen } : r))
    );
  }

  function addFood(data) {
    const food = {
      id: `f${Date.now()}`,
      restaurantId: MY_RESTAURANT_ID,
      restaurantName: restaurant?.name || "",
      rating: 0,
      reviewCount: 0,
      isAvailable: true,
      isPopular: false,
      extras: [],
      ...data,
    };
    setAllFoods((prev) => [...prev, food]);
    return food;
  }

  // Ownership guard: every mutation below only ever touches a food item
  // that belongs to the logged-in restaurant owner's own restaurant, even
  // if a caller somehow passed a foreign foodId.
  function updateFood(foodId, patch) {
    setAllFoods((prev) =>
      prev.map((f) => (f.id === foodId && f.restaurantId === MY_RESTAURANT_ID ? { ...f, ...patch } : f))
    );
  }

  function deleteFood(foodId) {
    setAllFoods((prev) => prev.filter((f) => !(f.id === foodId && f.restaurantId === MY_RESTAURANT_ID)));
  }

  function toggleFoodAvailability(foodId) {
    setAllFoods((prev) =>
      prev.map((f) =>
        f.id === foodId && f.restaurantId === MY_RESTAURANT_ID ? { ...f, isAvailable: !f.isAvailable } : f
      )
    );
  }

  function toggleFoodPopular(foodId) {
    setAllFoods((prev) =>
      prev.map((f) =>
        f.id === foodId && f.restaurantId === MY_RESTAURANT_ID ? { ...f, isPopular: !f.isPopular } : f
      )
    );
  }

  // ---- Admin-only actions (Step 8) — operate on the same registry ----

  function approveRestaurant(id) {
    setAllRestaurants((prev) => prev.map((r) => (r.id === id ? { ...r, approvalStatus: "APPROVED" } : r)));
  }

  function rejectRestaurant(id) {
    setAllRestaurants((prev) => prev.map((r) => (r.id === id ? { ...r, approvalStatus: "REJECTED" } : r)));
  }

  function blockRestaurant(id) {
    setAllRestaurants((prev) => prev.map((r) => (r.id === id ? { ...r, blocked: true } : r)));
  }

  function unblockRestaurant(id) {
    setAllRestaurants((prev) => prev.map((r) => (r.id === id ? { ...r, blocked: false } : r)));
  }

  const value = {
    // Live catalog — used by customer-facing pages for browsing/validation.
    restaurants,
    foods: allFoods,
    // Full registry — used by the Admin panel.
    allRestaurants,
    // Restaurant-panel-scoped view of the logged-in restaurant.
    restaurant,
    menuItems,
    categories,
    isOpen: restaurant?.isOpen ?? false,
    updateRestaurant,
    toggleOpen,
    addFood,
    updateFood,
    deleteFood,
    toggleFoodAvailability,
    toggleFoodPopular,
    approveRestaurant,
    rejectRestaurant,
    blockRestaurant,
    unblockRestaurant,
  };

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
}

export function useRestaurantData() {
  return useContext(RestaurantContext);
}
