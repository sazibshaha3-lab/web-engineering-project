import { createContext, useContext, useMemo, useState } from "react";
import { useOrders } from "./OrderContext";
import { initialRiders, LIVE_RIDER_ID } from "../data/riders";

const RiderContext = createContext(null);

const EARNING_PER_DELIVERY = 50;

export function RiderProvider({ children }) {
  const { orders, updateOrderStatus, assignRiderToOrder } = useOrders();
  // Full rider registry — single source of truth for both the Rider
  // panel (the logged-in demo rider) and the Admin Riders panel. There
  // is no separate "adminRiders" list.
  const [riders, setRiders] = useState(initialRiders);
  const [isAvailable, setIsAvailable] = useState(true);
  const [declinedIds, setDeclinedIds] = useState(() => new Set());

  const rider = useMemo(
    () => riders.find((r) => r.id === LIVE_RIDER_ID) || riders[0],
    [riders]
  );

  function setAvailability(next) {
    setIsAvailable(next);
  }

  function getAvailableDeliveries() {
    if (rider.approvalStatus !== "APPROVED" || !isAvailable) return [];
    return orders.filter(
      (o) => o.status === "READY_FOR_PICKUP" && !o.riderId && !declinedIds.has(o.id)
    );
  }

  function getAssignedDeliveries() {
    return orders.filter(
      (o) => o.riderId === rider.id && ["READY_FOR_PICKUP", "PICKED_UP", "OUT_FOR_DELIVERY"].includes(o.status)
    );
  }

  function getDeliveryHistory() {
    return orders.filter((o) => o.riderId === rider.id && o.status === "DELIVERED");
  }

  function acceptDelivery(orderId) {
    if (rider.approvalStatus !== "APPROVED") {
      return { success: false, message: "Your rider account is not approved for deliveries." };
    }
    if (!isAvailable) {
      return { success: false, message: "You are unavailable for new deliveries." };
    }

    const order = orders.find((o) => o.id === orderId);
    if (!order || order.status !== "READY_FOR_PICKUP") {
      return { success: false, message: "This delivery is no longer available." };
    }
    if (order.riderId) {
      return { success: false, message: "This delivery has already been assigned to another rider." };
    }

    const result = assignRiderToOrder(orderId, rider.id);
    if (!result.success) {
      return { success: false, message: "This delivery has already been assigned to another rider." };
    }
    return { success: true };
  }

  function rejectDelivery(orderId) {
    setDeclinedIds((prev) => new Set(prev).add(orderId));
  }

  function markPickedUp(orderId) {
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.riderId !== rider.id || order.status !== "READY_FOR_PICKUP") {
      return { success: false };
    }
    return updateOrderStatus(orderId, "PICKED_UP");
  }

  function startDelivery(orderId) {
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.riderId !== rider.id || order.status !== "PICKED_UP") {
      return { success: false };
    }
    return updateOrderStatus(orderId, "OUT_FOR_DELIVERY");
  }

  function markDelivered(orderId) {
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.riderId !== rider.id || order.status !== "OUT_FOR_DELIVERY") {
      return { success: false };
    }
    const result = updateOrderStatus(orderId, "DELIVERED");
    if (result.success) {
      setRiders((prev) => prev.map((r) => (r.id === rider.id ? { ...r, totalDeliveries: r.totalDeliveries + 1 } : r)));
    }
    return result;
  }

  function updateRiderProfile(patch) {
    setRiders((prev) => prev.map((r) => (r.id === rider.id ? { ...r, ...patch } : r)));
  }

  // ---- Admin-only actions (Step 8) — operate on the same registry ----

  function approveRider(id) {
    setRiders((prev) => prev.map((r) => (r.id === id ? { ...r, approvalStatus: "APPROVED" } : r)));
  }

  function rejectRider(id) {
    setRiders((prev) => prev.map((r) => (r.id === id ? { ...r, approvalStatus: "REJECTED" } : r)));
  }

  function blockRider(id) {
    setRiders((prev) => prev.map((r) => (r.id === id ? { ...r, approvalStatus: "BLOCKED" } : r)));
  }

  function unblockRider(id) {
    setRiders((prev) => prev.map((r) => (r.id === id ? { ...r, approvalStatus: "APPROVED" } : r)));
  }

  const deliveredToday = orders.filter((o) => o.riderId === rider.id && o.status === "DELIVERED").length;

  const stats = {
    todaysDeliveries: deliveredToday,
    activeDelivery: getAssignedDeliveries().length,
    completedDeliveries: getDeliveryHistory().length,
    todaysEarnings: deliveredToday * EARNING_PER_DELIVERY,
  };

  const value = {
    rider,
    riders,
    isAvailable,
    setAvailability,
    getAvailableDeliveries,
    getAssignedDeliveries,
    getDeliveryHistory,
    acceptDelivery,
    rejectDelivery,
    markPickedUp,
    startDelivery,
    markDelivered,
    updateRiderProfile,
    approveRider,
    rejectRider,
    blockRider,
    unblockRider,
    stats,
  };

  return <RiderContext.Provider value={value}>{children}</RiderContext.Provider>;
}

export function useRider() {
  return useContext(RiderContext);
}
