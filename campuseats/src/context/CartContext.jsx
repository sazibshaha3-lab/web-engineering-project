import { createContext, useContext, useMemo, useState } from "react";
import { validateRestaurantFoodRelation, findRestaurantById } from "../utils/dataValidation";
import { useRestaurantData } from "./RestaurantContext";

const CartContext = createContext(null);

function buildLineId(foodId, extras = [], customInstructions = "") {
  const extraKey = [...extras]
    .map((e) => e.id)
    .sort()
    .join(",");
  const noteKey = (customInstructions || "").trim().toLowerCase();
  return `${foodId}__${extraKey}__${noteKey}`;
}

function computeItemTotal(unitPrice, extras = [], quantity = 1) {
  const extrasTotal = extras.reduce((sum, e) => sum + (e.price || 0), 0);
  return (unitPrice + extrasTotal) * quantity;
}

const FAILURE_MESSAGES = {
  RESTAURANT_NOT_FOUND: "This restaurant is no longer available.",
  FOOD_NOT_FOUND: "This food item is no longer available.",
  FOOD_RESTAURANT_MISMATCH: "This food item is no longer available from this restaurant.",
  FOOD_UNAVAILABLE: "This food is currently unavailable.",
  RESTAURANT_CLOSED: "This restaurant is currently closed.",
  RESTAURANT_CONFLICT: "Your cart contains items from another restaurant.",
};

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [conflict, setConflict] = useState(null); // pending add blocked by a different restaurant in cart
  const { restaurants, foods } = useRestaurantData();

  function buildLineItem({ food, restaurant, quantity, extras, customInstructions }) {
    return {
      id: buildLineId(food.id, extras, customInstructions),
      foodId: food.id,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      name: food.name,
      image: food.image,
      unitPrice: food.price,
      quantity,
      extras,
      customInstructions: customInstructions || "",
      itemTotal: computeItemTotal(food.price, extras, quantity),
    };
  }

  function insertOrMergeLine(line) {
    setItems((prev) => {
      const existingIndex = prev.findIndex((it) => it.id === line.id);
      if (existingIndex === -1) return [...prev, line];
      const next = [...prev];
      const merged = { ...next[existingIndex] };
      merged.quantity += line.quantity;
      merged.itemTotal = computeItemTotal(merged.unitPrice, merged.extras, merged.quantity);
      next[existingIndex] = merged;
      return next;
    });
  }

  function addToCart({ foodId, restaurantId, quantity = 1, extras = [], customInstructions = "" }) {
    const result = validateRestaurantFoodRelation(restaurants, foods, restaurantId, foodId);
    if (!result.valid) {
      return { success: false, reason: result.reason, message: FAILURE_MESSAGES[result.reason] };
    }

    const { restaurant, food } = result;

    if (!food.isAvailable) {
      return { success: false, reason: "FOOD_UNAVAILABLE", message: FAILURE_MESSAGES.FOOD_UNAVAILABLE };
    }
    if (!restaurant.isOpen) {
      return { success: false, reason: "RESTAURANT_CLOSED", message: FAILURE_MESSAGES.RESTAURANT_CLOSED };
    }
    if (quantity <= 0) {
      return { success: false, reason: "INVALID_QUANTITY", message: "Choose a quantity of at least 1." };
    }

    const existingRestaurantId = items[0]?.restaurantId;
    if (existingRestaurantId && existingRestaurantId !== restaurant.id) {
      const pending = { food, restaurant, quantity, extras, customInstructions };
      setConflict({
        currentRestaurantName: items[0].restaurantName,
        newRestaurantName: restaurant.name,
        pending,
      });
      return { success: false, reason: "RESTAURANT_CONFLICT", message: FAILURE_MESSAGES.RESTAURANT_CONFLICT };
    }

    insertOrMergeLine(buildLineItem({ food, restaurant, quantity, extras, customInstructions }));
    return { success: true };
  }

  function resolveConflictKeepCurrent() {
    setConflict(null);
  }

  function resolveConflictClearAndAdd() {
    if (!conflict) return;
    const { food, restaurant, quantity, extras, customInstructions } = conflict.pending;
    setItems([buildLineItem({ food, restaurant, quantity, extras, customInstructions })]);
    setConflict(null);
  }

  function updateQuantity(lineId, newQuantity) {
    setItems((prev) => {
      const qty = Math.max(0, newQuantity);
      if (qty === 0) return prev.filter((it) => it.id !== lineId);
      return prev.map((it) =>
        it.id === lineId
          ? { ...it, quantity: qty, itemTotal: computeItemTotal(it.unitPrice, it.extras, qty) }
          : it
      );
    });
  }

  function removeFromCart(lineId) {
    setItems((prev) => prev.filter((it) => it.id !== lineId));
  }

  function clearCart() {
    setItems([]);
  }

  function getItemQuantity(foodId) {
    return items.filter((it) => it.foodId === foodId).reduce((sum, it) => sum + it.quantity, 0);
  }

  // Used by OrderContext.reorder(): atomically replaces the cart with the
  // valid, currently-available items from a past order for one restaurant.
  // Returns a summary instead of throwing, so the caller can show the
  // right toast/messages ("Some items are unavailable", etc.).
  function reorderItems(order) {
    const restaurant = findRestaurantById(restaurants, order.restaurantId);
    if (!restaurant) {
      return { success: false, addedCount: 0, unavailableCount: order.items.length, allUnavailable: true };
    }

    const validLines = [];
    let unavailableCount = 0;

    order.items.forEach((item) => {
      const result = validateRestaurantFoodRelation(restaurants, foods, order.restaurantId, item.foodId);
      if (!result.valid || !result.food.isAvailable) {
        unavailableCount += 1;
        return;
      }
      validLines.push(
        buildLineItem({
          food: result.food,
          restaurant,
          quantity: item.quantity,
          extras: item.extras || [],
          customInstructions: item.customInstructions || "",
        })
      );
    });

    if (validLines.length === 0) {
      return { success: false, addedCount: 0, unavailableCount, allUnavailable: true, restaurantId: restaurant.id };
    }

    const merged = [];
    validLines.forEach((line) => {
      const existing = merged.find((m) => m.id === line.id);
      if (existing) {
        existing.quantity += line.quantity;
        existing.itemTotal = computeItemTotal(existing.unitPrice, existing.extras, existing.quantity);
      } else {
        merged.push({ ...line });
      }
    });

    setItems(merged);
    setConflict(null);
    return { success: true, addedCount: merged.length, unavailableCount, allUnavailable: false, restaurantId: restaurant.id };
  }

  const totalItems = useMemo(() => items.reduce((sum, it) => sum + it.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, it) => sum + it.itemTotal, 0), [items]);
  const cartRestaurantId = items[0]?.restaurantId || null;
  const cartRestaurantName = items[0]?.restaurantName || null;

  const value = {
    items,
    totalItems,
    subtotal,
    cartRestaurantId,
    cartRestaurantName,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    reorderItems,
    conflict,
    resolveConflictKeepCurrent,
    resolveConflictClearAndAdd,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
