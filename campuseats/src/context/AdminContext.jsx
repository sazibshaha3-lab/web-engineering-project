import { createContext, useContext, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { useOrders } from "./OrderContext";
import { useRestaurantData } from "./RestaurantContext";
import { useRider } from "./RiderContext";
import { isLiveOrderActive } from "../utils/statusMaps";

const AdminContext = createContext(null);

// AdminContext does NOT keep its own copy of orders, restaurants, riders
// or customers — per Step 8's single-source-of-truth rule, all of that
// still lives in OrderContext / RestaurantContext / RiderContext /
// AuthContext. This context only composes those into the derived
// statistics and convenience actions every Admin page needs, so pages
// call one `useAdmin()` hook instead of wiring up four contexts each.
export function AdminProvider({ children }) {
  const { customers, blockCustomer, unblockCustomer } = useAuth();
  const { orders, updateOrderStatus, getOrderById, cancelOrder } = useOrders();
  const {
    allRestaurants,
    foods,
    approveRestaurant,
    rejectRestaurant,
    blockRestaurant,
    unblockRestaurant,
  } = useRestaurantData();
  const { riders, isAvailable, approveRider, rejectRider, blockRider, unblockRider } = useRider();

  const stats = useMemo(() => {
    const activeOrders = orders.filter((o) => isLiveOrderActive(o.status)).length;
    const completedOrders = orders.filter((o) => o.status === "DELIVERED").length;
    const cancelledOrders = orders.filter((o) => o.status === "CANCELLED" || o.status === "REJECTED").length;

    return {
      totalCustomers: customers.length,
      totalRestaurants: allRestaurants.length,
      pendingRestaurants: allRestaurants.filter((r) => r.approvalStatus === "PENDING").length,
      totalRiders: riders.length,
      pendingRiders: riders.filter((r) => r.approvalStatus === "PENDING").length,
      totalOrders: orders.length,
      activeOrders,
      completedOrders,
      cancelledOrders,
    };
  }, [customers, allRestaurants, riders, orders]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8),
    [orders]
  );

  const pendingRestaurantsList = useMemo(
    () => allRestaurants.filter((r) => r.approvalStatus === "PENDING"),
    [allRestaurants]
  );

  const pendingRidersList = useMemo(() => riders.filter((r) => r.approvalStatus === "PENDING"), [riders]);

  const recentlyCompletedOrders = useMemo(
    () => orders.filter((o) => o.status === "DELIVERED").slice(0, 5),
    [orders]
  );

  const value = {
    // Read-through data (still owned by their original contexts).
    customers,
    orders,
    allRestaurants,
    foods,
    riders,
    liveRiderIsAvailable: isAvailable,
    getOrderById,
    // Derived, deterministic — recomputed from current state, never
    // random or duplicated.
    stats,
    recentOrders,
    pendingRestaurantsList,
    pendingRidersList,
    recentlyCompletedOrders,
    // Actions — thin pass-throughs to the owning context.
    updateOrderStatus,
    cancelOrder,
    blockCustomer,
    unblockCustomer,
    approveRestaurant,
    rejectRestaurant,
    blockRestaurant,
    unblockRestaurant,
    approveRider,
    rejectRider,
    blockRider,
    unblockRider,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  return useContext(AdminContext);
}
