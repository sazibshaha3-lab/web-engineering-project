import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import api, { apiErrorMessage } from "../services/api";
import { useAuth } from "./AuthContext";
import { useOrders } from "./OrderContext";
import { useToast } from "../components/feedback/ToastContext";
import { normalizeOrder } from "../services/orderApi";
import { normalizeRider } from "../services/peopleApi";

const RiderContext = createContext(null);

const EARNING_PER_DELIVERY = 50;
const POLL_MS = 10000;
const ACTIVE = ["READY_FOR_PICKUP", "PICKED_UP", "OUT_FOR_DELIVERY"];

export function RiderProvider({ children }) {
  const { user, refreshUser } = useAuth();
  const { orders, updateOrderStatus, reload: reloadOrders } = useOrders();
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const notify = (message, tone = "error") => toastRef.current?.showToast(message, tone);

  const [adminRiders, setAdminRiders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [declinedIds, setDeclinedIds] = useState(() => new Set());

  const isRider = user?.role === "rider";
  const isAdmin = user?.role === "admin";

  // Logged-in rider: `user.rider` from /me plus the user's name/email/phone
  const rider = useMemo(
    () => (isRider && user?.rider ? normalizeRider({ ...user.rider, user }) : null),
    [isRider, user]
  );
  // Admin sees every rider (/admin/riders); the rider panel only sees their own record.
  const riders = isAdmin ? adminRiders : rider ? [rider] : [];

  const isApproved = rider?.approvalStatus === "APPROVED";

  // ---------- Admin: rider registry ----------
  useEffect(() => {
    if (!isAdmin) {
      setAdminRiders([]);
      return;
    }
    let cancelled = false;
    api
      .get("/admin/riders")
      .then(({ data }) => !cancelled && setAdminRiders(data.map(normalizeRider)))
      .catch((err) => !cancelled && notify(apiErrorMessage(err, "Could not load riders.")));
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  // ---------- Rider: orders waiting for a rider (READY_FOR_PICKUP, unassigned) ----------
  const loadAvailable = useCallback(async () => {
    try {
      const { data } = await api.get("/rider/available-orders");
      setAvailableOrders(data.map(normalizeOrder));
    } catch {
      // the next poll retries
    }
  }, []);

  useEffect(() => {
    if (!isRider || !isApproved) {
      setAvailableOrders([]);
      return;
    }
    loadAvailable();
    const tick = () => {
      if (!document.hidden) loadAvailable();
    };
    const timer = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [isRider, isApproved, loadAvailable]);

  function setAvailability(next) {
    setIsAvailable(next);
  }

  function getAvailableDeliveries() {
    if (!rider || !isApproved || !isAvailable) return [];
    return availableOrders.filter((o) => !declinedIds.has(o.id));
  }

  function getAssignedDeliveries() {
    if (!rider) return [];
    return orders.filter((o) => o.riderId === rider.id && ACTIVE.includes(o.status));
  }

  function getDeliveryHistory() {
    if (!rider) return [];
    return orders.filter((o) => o.riderId === rider.id && o.status === "DELIVERED");
  }

  async function acceptDelivery(orderId) {
    if (!rider || !isApproved) {
      return { success: false, message: "Your rider account is not approved for deliveries." };
    }
    if (!isAvailable) {
      return { success: false, message: "You are unavailable for new deliveries." };
    }

    const order = availableOrders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, message: "This delivery is no longer available." };
    }

    try {
      await api.post(`/rider/orders/${order.dbId}/claim`);
      await reloadOrders(); // bring the claimed order into OrderContext's list
      loadAvailable();
      return { success: true };
    } catch (err) {
      loadAvailable();
      const taken = err?.response?.status === 409;
      return {
        success: false,
        message: taken
          ? "This delivery has already been assigned to another rider."
          : apiErrorMessage(err, "Could not accept this delivery."),
      };
    }
  }

  function rejectDelivery(orderId) {
    setDeclinedIds((prev) => new Set(prev).add(orderId));
  }

  async function transition(orderId, from, to) {
    const order = orders.find((o) => o.id === orderId);
    if (!order || !rider || order.riderId !== rider.id || order.status !== from) {
      return { success: false, message: "This delivery can no longer be updated that way." };
    }
    return updateOrderStatus(orderId, to);
  }

  const markPickedUp = (orderId) => transition(orderId, "READY_FOR_PICKUP", "PICKED_UP");
  const startDelivery = (orderId) => transition(orderId, "PICKED_UP", "OUT_FOR_DELIVERY");

  async function markDelivered(orderId) {
    const result = await transition(orderId, "OUT_FOR_DELIVERY", "DELIVERED");
    if (result.success) refreshUser(); // the server incremented totalDeliveries; fetch the new count
    return result;
  }

  async function updateRiderProfile(patch) {
    try {
      await api.put("/rider/profile", {
        name: patch.name,
        phone: patch.phone,
        vehicleType: patch.vehicleType,
        vehicleNumber: patch.vehicleNumber,
      });
      await refreshUser();
      return { success: true };
    } catch (err) {
      return { success: false, message: apiErrorMessage(err, "Could not update your profile.") };
    }
  }

  // ---------- Admin-only actions (optimistic, rolled back on failure) ----------
  async function adminSetRider(id, approvalStatus) {
    const previous = adminRiders;
    setAdminRiders((prev) => prev.map((r) => (r.id === id ? { ...r, approvalStatus } : r)));
    try {
      await api.patch(`/admin/riders/${id}/approval`, { approvalStatus });
    } catch (err) {
      setAdminRiders(previous);
      notify(apiErrorMessage(err, "Action failed."));
    }
  }

  const approveRider = (id) => adminSetRider(id, "APPROVED");
  const rejectRider = (id) => adminSetRider(id, "REJECTED");
  const blockRider = (id) => adminSetRider(id, "BLOCKED");
  const unblockRider = (id) => adminSetRider(id, "APPROVED");

  const deliveredCount = getDeliveryHistory().length;

  const stats = {
    todaysDeliveries: deliveredCount,
    activeDelivery: getAssignedDeliveries().length,
    completedDeliveries: deliveredCount,
    todaysEarnings: deliveredCount * EARNING_PER_DELIVERY,
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
