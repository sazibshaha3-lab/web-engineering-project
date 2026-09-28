// Mock, display-only restaurant reviews — no submission flow in Step 3.

export const reviews = [
  { id: "rev1", restaurantId: "r1", author: "Tanjila R.", rating: 5, comment: "The smoky beef burger is worth every taka. Always hot on arrival.", daysAgo: 2 },
  { id: "rev2", restaurantId: "r1", author: "Fahim K.", rating: 4, comment: "Great wings, though delivery took a bit longer during rush hour.", daysAgo: 6 },
  { id: "rev3", restaurantId: "r1", author: "Nusrat J.", rating: 5, comment: "My go-to order between classes. Never disappoints.", daysAgo: 11 },

  { id: "rev4", restaurantId: "r2", author: "Rakib H.", rating: 5, comment: "Best kacchi near campus, hands down. Meat was so tender.", daysAgo: 1 },
  { id: "rev5", restaurantId: "r2", author: "Mahin A.", rating: 5, comment: "Ordered for a group study session — everyone loved it.", daysAgo: 4 },
  { id: "rev6", restaurantId: "r2", author: "Sabrina I.", rating: 4, comment: "Portion size is generous. Borhani is a must-add.", daysAgo: 9 },

  { id: "rev7", restaurantId: "r3", author: "Imon S.", rating: 4, comment: "Solid late-night option after the library closes.", daysAgo: 3 },
  { id: "rev8", restaurantId: "r3", author: "Priya D.", rating: 5, comment: "Loaded fries hit different at 1am.", daysAgo: 8 },

  { id: "rev9", restaurantId: "r4", author: "Arif M.", rating: 4, comment: "Margherita is simple but done right.", daysAgo: 5 },
  { id: "rev10", restaurantId: "r4", author: "Lubna T.", rating: 5, comment: "Wood-fired crust makes a real difference.", daysAgo: 14 },

  { id: "rev11", restaurantId: "r5", author: "Kamrul B.", rating: 5, comment: "Tastes exactly like home cooking. The bhuna is excellent.", daysAgo: 2 },
  { id: "rev12", restaurantId: "r5", author: "Farzana N.", rating: 4, comment: "Reliable daily option, good value for money.", daysAgo: 10 },

  { id: "rev13", restaurantId: "r6", author: "Shuvo R.", rating: 5, comment: "Lava cake is unreal. Order it warm and thank me later.", daysAgo: 3 },
  { id: "rev14", restaurantId: "r6", author: "Anika F.", rating: 4, comment: "Waffles are great, a little pricey for the portion.", daysAgo: 7 },
];

export function getReviewsByRestaurantId(restaurantId) {
  return reviews.filter((r) => r.restaurantId === restaurantId);
}
