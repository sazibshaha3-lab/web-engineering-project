import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
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
  const [ordersLoading, setOrdersLoading] = useState(true);
  const orderRevision = useRef(0);
  const fetchSequence = useRef(0);
  const latestAppliedFetch = useRef(0);
  const currentUserId = useRef(null);
  currentUserId.current = user?.id == null ? null : String(user.id);

  const loadOrders = useCallback(async () => {
    const requestUserId = currentUserId.current;
    const requestRevision = orderRevision.current;
    const requestSequence = ++fetchSequence.current;
    try {
      const { data } = await api.get("/orders");
      if (
        requestUserId !== currentUserId.current ||
        requestRevision !== orderRevision.current ||
        requestSequence < latestAppliedFetch.current
      ) return true;

      latestAppliedFetch.current = requestSequence;
      setOrders(data.map(normalizeOrder));
      return true;
    } catch {
      // network error: ager list-i thakbe, porer poll e abar try hobe
      return false;
    }
  }, []);

  useEffect(() => {
    orderRevision.current += 1;
    setOrders([]);
    if (!user) {
      setOrdersLoading(false);
      return;
    }
    setOrdersLoading(true);
    loadOrders().finally(() => setOrdersLoading(false));

    const tick = () => {
      if (!document.hidden) loadOrders();
    };
    const timer = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
    };
  }, [user?.id, loadOrders]);

  function replaceOrder(raw) {
    const next = normalizeOrder(raw);
    orderRevision.current += 1;
    setOrders((prev) => (prev.some((o) => o.id === next.id) ? prev.map((o) => (o.id === next.id ? next : o)) : [next, ...prev]));
    return next;
  }

  const findOrder = (id) => orders.find((o) => o.id === id) || null;

  // Server price, fee, total nijei hishab kore (frontend er subtotal trust kore na).
  async function createOrder({ restaurant, items, deliveryAddress, deliveryInstructions, idempotencyKey }) {
    try {
      const { data } = await api.post(
        "/orders",
        toOrderPayload({ restaurant, items, deliveryAddress, deliveryInstructions, idempotencyKey })
      );
      const order = replaceOrder(data);
      return { success: true, order };
    } catch (err) {
      const reason = err.response?.data?.reason ?? null;
      if (err.response?.status === 403) {
        return {
          success: false,
          reason: 'CUSTOMER_ACCOUNT_REQUIRED',
          message: 'This account cannot place customer orders. Sign in with a customer account and try again.',
        };
      }
      return { ...fail(err, "Could not place your order. Please try again."), reason };
    }
  }

  function getOrderById(id) {
    return findOrder(id);
  }

  const loadOrderByNumber = useCallback(async (orderNumber) => {
    const rememberOrder = (raw) => {
      const order = normalizeOrder(raw);
      orderRevision.current += 1;
      setOrders((previous) => (
        previous.some((item) => item.id === order.id)
          ? previous.map((item) => item.id === order.id ? order : item)
          : [order, ...previous]
      ));
      return order;
    };

    try {
      const { data } = await api.get(`/orders/by-number/${encodeURIComponent(orderNumber)}`);
      const order = rememberOrder(data);
      return { success: true, order };
    } catch (lookupError) {
      // Older deployed APIs may not yet have /orders/by-number. The authorized
      // /orders endpoint is already available; resolve the public order number there.
      try {
        const { data } = await api.get("/orders");
        const rawOrder = data.find((item) => item.orderNumber === orderNumber);
        if (rawOrder) return { success: true, order: rememberOrder(rawOrder) };
        return { success: false, message: "This order was not found in your account. Open Orders and try again." };
      } catch {
        return {
          success: false,
          message: apiErrorMessage(lookupError, "Could not load this order. Check your connection and try again."),
        };
      }
    }
  }, []);

  function getActiveOrders() {
    return orders.filter((o) => isLiveOrderActive(o.status));
  }

  function getPastOrders() {
    return orders.filter((o) => !isLiveOrderActive(o.status));
  }

  // Restaurant (accept/reject/prepare/ready) ar rider (picked up/out/delivered) duijon-i eta use kore.
  // Kon role kon transition korte pare sheta server-i thik kore dey.
  async function updateOrderStatus(id, status, details = {}) {
    const order = findOrder(id);
    if (!order) return { success: false, reason: "ORDER_NOT_FOUND", message: "Order not found." };
    try {
      const { data } = await api.patch(`/orders/${order.dbId}/status`, { status, ...details });
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
    loadOrderByNumber,
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
