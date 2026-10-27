import api from "./api";

// "Fast Food" -> "fastfood" (frontend category ids are these slugs)
const slugify = (name = "") => name.toLowerCase().replace(/\s+/g, "");

export function buildCategoryMaps(apiCategories = []) {
  const idToSlug = {};
  const slugToId = {};
  apiCategories.forEach((c) => {
    const slug = slugify(c.name);
    idToSlug[c.id] = slug;
    slugToId[slug] = c.id;
  });
  return { idToSlug, slugToId };
}

// Frontend code compares ids with === (route params are strings),
// so every id coming from the API is converted to a string here.
export function normalizeRestaurant(r) {
  const { foods, ...rest } = r;
  return {
    ...rest,
    id: String(r.id),
    isOpen: r.isOpen ?? r.is_open,
    deliveryFee: r.deliveryFee ?? r.delivery_fee,
    minimumOrder: r.minimumOrder ?? r.minimum_order,
    deliveryTime: r.deliveryTime ?? r.delivery_time ?? "",
    openingTime: r.openingTime ?? r.opening_time ?? "",
    closingTime: r.closingTime ?? r.closing_time ?? "",
    owner: r.owner && typeof r.owner === "object" ? r.owner.name ?? "" : r.owner ?? "",
    image: r.image ?? "",
    logo: r.logo ?? "",
    description: r.description ?? "",
    category: r.category ?? "",
  };
}

export function normalizeFood(f, idToSlug = {}) {
  return {
    ...f,
    id: String(f.id),
    restaurantId: String(f.restaurantId ?? f.restaurant_id),
    categoryId: f.categoryId ?? f.category_id,
    isAvailable: f.isAvailable ?? f.is_available,
    restaurantName: f.restaurant?.name ?? f.restaurantName ?? "",
    category: idToSlug[f.categoryId ?? f.category_id] ?? "",
    image: f.image ?? "",
    description: f.description ?? "",
    preparationTime: f.preparationTime ?? "",
    extras: (f.extras ?? []).map((e) => ({ ...e, id: String(e.id) })),
  };
}

export function normalizeReview(rv) {
  const days = Math.floor((Date.now() - new Date(rv.createdAt).getTime()) / 86400000);
  return {
    id: String(rv.id),
    restaurantId: String(rv.restaurantId),
    author: rv.user?.name ?? "Customer",
    rating: rv.rating,
    comment: rv.comment ?? "",
    daysAgo: Math.max(days, 0),
  };
}

export async function fetchReviews(restaurantId) {
  const { data } = await api.get(`/restaurants/${restaurantId}/reviews`);
  return data.map(normalizeReview);
}

// FoodForm er data -> API payload. Shudhu jei key gulo pathano hoy sheigulo update hoy
// (tai toggle er somoy `{ isAvailable }` pathale extras muche jay na).
export function toFoodPayload(data, slugToId = {}) {
  const { category, extras, id, restaurantId, restaurantName, rating, reviewCount, ...rest } = data;
  const payload = { ...rest };
  if (category !== undefined) payload.categoryId = slugToId[category] ?? null;
  if (extras !== undefined) {
    payload.extras = extras.map(({ name, price }) => ({ name, price: Number(price) }));
  }
  return payload;
}
