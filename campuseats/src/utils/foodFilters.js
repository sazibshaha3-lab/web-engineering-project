export const foodSortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "popular", label: "Popular first" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Rating" },
];

export function matchesFoodSearch(food, query) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    food.name.toLowerCase().includes(q) ||
    (food.description || "").toLowerCase().includes(q) ||
    (food.category || "").toLowerCase().includes(q)
  );
}

export function sortFoods(list, sortBy) {
  const copy = [...list];
  switch (sortBy) {
    case "popular":
      return copy.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    case "price_asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price_desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    default:
      return copy;
  }
}

export function groupFoodsByCategory(list) {
  const groups = [];
  const index = new Map();
  list.forEach((food) => {
    const key = food.category || "Other";
    if (!index.has(key)) {
      index.set(key, groups.length);
      groups.push({ category: key, foods: [] });
    }
    groups[index.get(key)].foods.push(food);
  });
  return groups;
}
