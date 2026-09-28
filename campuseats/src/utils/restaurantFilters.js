export function avgDeliveryMinutes(range = "") {
  const nums = range.match(/\d+/g)?.map(Number) || [30];
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "rating", label: "Rating" },
  { value: "delivery_time", label: "Delivery time" },
  { value: "delivery_fee", label: "Delivery fee" },
];

export const ratingOptions = [
  { value: "any", label: "Any rating" },
  { value: "4.5", label: "4.5 & above" },
  { value: "4.0", label: "4.0 & above" },
];

export const deliveryTimeOptions = [
  { value: "any", label: "Any time" },
  { value: "20", label: "Under 20 min" },
  { value: "30", label: "Under 30 min" },
];

export function sortRestaurants(list, sortBy) {
  const copy = [...list];
  switch (sortBy) {
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "delivery_time":
      return copy.sort((a, b) => avgDeliveryMinutes(a.deliveryTime) - avgDeliveryMinutes(b.deliveryTime));
    case "delivery_fee":
      return copy.sort((a, b) => a.deliveryFee - b.deliveryFee);
    default:
      return copy;
  }
}
