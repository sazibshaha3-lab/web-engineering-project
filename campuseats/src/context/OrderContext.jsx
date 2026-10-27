import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { apiErrorMessage } from "../services/api";
import { isLiveOrderActive } from "../utils/statusMaps";
import { normalizeOrder, toOrderPayload } from "../services/orderApi";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import { useRestaurantData } from "./RestaurantContext";

const OrderContext = createContext(null);

// Orders ke dosh sekondey ekbar server theke refresh kora hoy, jate restaurant/rider er
// status change customer er screen e (ar ulto) dekha jay.
const POLL_MS = 10000;

const fail = (err, fallback, reason) => ({ success: false, reason, message: apiErrorMessage(err, fallback) });

export function OrderProvider({ children }) {
  const { user } = useAuth();
  const { reorderItems } = useCart();
  const { reload: reloadRestaurants } = useRestaurantData();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const { data } = await api.get("/orders");
      setOrders(data.map(normalizeOrder));
      return true;
    } catch {
      // network error: ager list-i thakbe, porer poll e abar try hobe
      return false;
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    setOrdersLoading(true);
    loadOrders().finally(() => setOrdersLoading(false));

    const tick = () => {
      if (!document.hidden) loadOrders();
    };
    const timer = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [user?.id, loadOrders]);

  function replaceOrder(raw) {
    const next = normalizeOrder(raw);
    setOrders((prev) => (prev.some((o) => o.id === next.id) ? prev.map((o) => (o.id === next.id ? next : o)) : [next, ...prev]));
    return next;
  }

  const findOrder = (id) => orders.find((o) => o.id === id) || null;

  // Server price, fee, total nijei hishab kore (frontend er subtotal trust kore na).
  async function createOrder({ restaurant, items, deliveryAddress, deliveryInstructions, paymentMethod }) {
    try {
      const { data } = await api.post(
        "/orders",
        toOrderPayload({ restaurant, items, deliveryAddress, deliveryInstructions, paymentMethod })
      );
      const order = replaceOrder(data);
      return { success: true, order };
    } catch (err) {
      return fail(err, "Could not place your order. Please try again.");
    }
  }

  function getOrderById(id) {
    return findOrder(id);
  }

  function getActiveOrders() {
    return orders.filter((o) => isLiveOrderActive(o.status));
  }

  function getPastOrders() {
    return orders.filter((o) => !isLiveOrderActive(o.status));
  }

  // Restaurant (accept/reject/prepare/ready) ar rider (picked up/out/delivered) duijon-i eta use kore.
  // Kon role kon transition korte pare sheta server-i thik kore dey.
  async function updateOrderStatus(id, status) {
    const order = findOrder(id);
    if (!order) return { success: false, reason: "ORDER_NOT_FOUND", message: "Order not found." };
    try {
      const { data } = await api.patch(`/orders/${order.dbId}/status`, { status });
      replaceOrder(data);
      return { success: true };
    } catch (err) {
      return fail(err, "This order can no longer be updated that way.", "INVALID_TRANSITION");
    }
  }

  // Rider claim: rider ke server login token theke chene, riderId pathate hoy na.
  async function assignRiderToOrder(orderId) {
    const order = findOrder(orderId);
    if (!order) return { success: false, reason: "ORDER_NOT_FOUND" };
    try {
      const { data } = await api.post(`/rider/orders/${order.dbId}/claim`);
      replaceOrder(data);
      return { success: true };
    } catch (err) {
      return fail(err, "This delivery has already been assigned to another rider.", "ALREADY_ASSIGNED");
    }
  }

  async function cancelOrder(id) {
    const order = findOrder(id);
    if (!order) return { success: false, message: "Order not found." };
    try {
      // Admin uses its own endpoint (the customer one is customer-only)
      const path = user?.role === "admin" ? `/admin/orders/${order.dbId}/cancel` : `/orders/${order.dbId}/cancel`;
      const { data } = await api.post(path);
      replaceOrder(data);
      return { success: true };
    } catch (err) {
      return fail(err, "This order can no longer be cancelled.");
    }
  }

  // Backend e shudhu restaurant rating (1-5) + comment ache; "food rating" save hoy na.
  async function submitReview(id, review) {
    const order = findOrder(id);
    if (!order) return { success: false, message: "Order not found." };
    try {
      await api.post(`/orders/${order.dbId}/review`, {
        rating: review.restaurantRating,
        comment: review.text || null,
      });
      await loadOrders();
      reloadRestaurants(); // restaurant er notun rating/review count
      return { success: true };
    } catch (err) {
      return fail(err, "Could not submit your review.");
    }
  }

  function reorder(orderId) {
    const order = findOrder(orderId);
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
    ordersLoading,
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
    reload: loadOrders,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  return useContext(OrderContext);
}
