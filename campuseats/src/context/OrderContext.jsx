import { createContext, useContext, useMemo, useState } from "react";
import { isLiveOrderActive } from "../utils/statusMaps";
import { useCart } from "./CartContext";
import { currentCustomer } from "../data/users";

const OrderContext = createContext(null);

let orderSeq = 10240;

// Centralized status transition rules (Step 6 + Step 7).
// Every transition in the order lifecycle is driven by an explicit actor
// action (restaurant or rider) — there is no automatic background
// progression — so a single map covers both actors' allowed moves.
const ALLOWED_TRANSITIONS = {
  PLACED: ["ACCEPTED", "REJECTED"], // restaurant
  ACCEPTED: ["PREPARING"], // restaurant
  PREPARING: ["READY_FOR_PICKUP"], // restaurant
  READY_FOR_PICKUP: ["PICKED_UP"], // rider
  PICKED_UP: ["OUT_FOR_DELIVERY"], // rider
  OUT_FOR_DELIVERY: ["DELIVERED"], // rider
};

function estimateDeliveryWindow(deliveryTime) {
  return deliveryTime || "30-40 min";
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const { reorderItems } = useCart();

  function createOrder({
    restaurant,
    items,
    subtotal,
    deliveryFee,
    discount = 0,
    deliveryAddress,
    deliveryInstructions,
    paymentMethod,
  }) {
    orderSeq += 1;
    const order = {
      id: `ORD-${orderSeq}`,
      customerId: currentCustomer.id,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantLogo: restaurant.logo,
      restaurantImage: restaurant.image,
      items,
      subtotal,
      deliveryFee,
      discount,
      total: subtotal + deliveryFee - discount,
      deliveryAddress,
      deliveryInstructions,
      paymentMethod,
      paymentStatus: paymentMethod === "online" ? "PAID" : "PENDING",
      status: "PLACED",
      riderId: null,
      createdAt: new Date().toISOString(),
      estimatedDeliveryTime: estimateDeliveryWindow(restaurant.deliveryTime),
      review: null,
    };

    setOrders((prev) => [order, ...prev]);
    return order;
  }

  function getOrderById(id) {
    return orders.find((o) => o.id === id) || null;
  }

  function getActiveOrders() {
    return orders.filter((o) => isLiveOrderActive(o.status));
  }

  function getPastOrders() {
    return orders.filter((o) => !isLiveOrderActive(o.status));
  }

  function updateOrderStatus(id, status) {
    const order = orders.find((o) => o.id === id);
    if (!order) return { success: false, reason: "ORDER_NOT_FOUND" };

    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      return { success: false, reason: "INVALID_TRANSITION" };
    }

    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    return { success: true };
  }

  function assignRiderToOrder(orderId, riderId) {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, reason: "ORDER_NOT_FOUND" };
    if (order.status !== "READY_FOR_PICKUP") return { success: false, reason: "NOT_READY" };
    if (order.riderId) return { success: false, reason: "ALREADY_ASSIGNED" };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, riderId } : o)));
    return { success: true };
  }

  function cancelOrder(id) {
    const order = orders.find((o) => o.id === id);
    if (!order || order.status !== "PLACED") return { success: false };

    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "CANCELLED" } : o)));
    return { success: true };
  }

  function submitReview(id, review) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, review } : o)));
  }

  function reorder(orderId) {
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, addedCount: 0, unavailableCount: 0, allUnavailable: true, restaurantId: null };
    }
    return reorderItems(order);
  }

  const activeOrder = useMemo(() => {
    const active = orders.filter((o) => isLiveOrderActive(o.status));
    return active.length > 0 ? active[0] : null;
  }, [orders]);

  const value = {
    orders,
    activeOrder,
    createOrder,
    getOrderById,
    getActiveOrders,
    getPastOrders,
    updateOrderStatus,
    assignRiderToOrder,
    cancelOrder,
    reorder,
    submitReview,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  return useContext(OrderContext);
}
