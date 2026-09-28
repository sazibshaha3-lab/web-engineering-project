// Central validation helpers for the restaurant/food mock-data relationship.
// These never throw for normal validation failures — callers get a safe,
// predictable result they can branch on to show the right UI state.

export function findRestaurantById(restaurants = [], restaurantId) {
  if (!restaurantId || !Array.isArray(restaurants)) return null;
  return restaurants.find((r) => r?.id === restaurantId) || null;
}

export function findFoodById(foods = [], foodId) {
  if (!foodId || !Array.isArray(foods)) return null;
  return foods.find((f) => f?.id === foodId) || null;
}

export function getFoodsByRestaurantId(foods = [], restaurantId) {
  if (!restaurantId || !Array.isArray(foods)) return [];
  return foods.filter((f) => f?.restaurantId === restaurantId);
}

/**
 * Validates that a restaurant exists, a food exists, and the food actually
 * belongs to that restaurant. Returns a uniform result shape so pages can
 * render an exact, predictable error state instead of guessing.
 */
export function validateRestaurantFoodRelation(restaurants = [], foods = [], restaurantId, foodId) {
  const restaurant = findRestaurantById(restaurants, restaurantId);
  if (!restaurant) {
    return { valid: false, restaurant: null, food: null, reason: "RESTAURANT_NOT_FOUND" };
  }

  const food = findFoodById(foods, foodId);
  if (!food) {
    return { valid: false, restaurant, food: null, reason: "FOOD_NOT_FOUND" };
  }

  if (food.restaurantId !== restaurant.id) {
    return { valid: false, restaurant, food: null, reason: "FOOD_RESTAURANT_MISMATCH" };
  }

  return { valid: true, restaurant, food, reason: null };
}

/**
 * Sanity-checks the whole mock dataset during development. Never surfaces
 * technical details to end users — only logs, and only via console.warn.
 */
export function validateMockData(restaurants = [], foods = []) {
  const issues = [];

  const seenRestaurantIds = new Set();
  restaurants.forEach((r) => {
    if (!r?.id) {
      issues.push("A restaurant is missing an id.");
      return;
    }
    if (seenRestaurantIds.has(r.id)) {
      issues.push(`Duplicate restaurant id detected: "${r.id}".`);
    }
    seenRestaurantIds.add(r.id);
  });

  const seenFoodIds = new Set();
  foods.forEach((f) => {
    if (!f?.id) {
      issues.push("A food item is missing an id.");
      return;
    }
    if (seenFoodIds.has(f.id)) {
      issues.push(`Duplicate food id detected: "${f.id}".`);
    }
    seenFoodIds.add(f.id);

    if (!f.restaurantId) {
      issues.push(`Food "${f.id}" is missing a restaurantId.`);
    } else if (!seenRestaurantIds.has(f.restaurantId)) {
      issues.push(`Food "${f.id}" references a non-existent restaurant "${f.restaurantId}".`);
    }
  });

  if (issues.length > 0 && typeof console !== "undefined") {
    console.warn("[CampusEats mock data] Validation issues found:\n" + issues.join("\n"));
  }

  return { valid: issues.length === 0, issues };
}
