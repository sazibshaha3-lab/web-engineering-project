import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import api, { apiErrorMessage } from "../services/api";
import { useAuth } from "./AuthContext";
import { useToast } from "../components/feedback/ToastContext";
import { buildCategoryMaps, normalizeFood, normalizeRestaurant, toFoodPayload } from "../services/restaurantApi";

const RestaurantContext = createContext(null);

const OK = { success: true };
const fail = (err, fallback) => ({ success: false, message: apiErrorMessage(err, fallback) });

export function RestaurantDataProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const notify = (message, tone = "error") => toastRef.current?.showToast(message, tone);

  const [loading, setLoading] = useState(true);
  const [maps, setMaps] = useState({ idToSlug: {}, slugToId: {} });
  const [publicRestaurants, setPublicRestaurants] = useState([]);
  const [publicFoods, setPublicFoods] = useState([]);
  const [myRestaurant, setMyRestaurant] = useState(null);
  const [myFoods, setMyFoods] = useState([]);
  const [adminRestaurants, setAdminRestaurants] = useState([]);

  // ---------- Public catalog (approved + not blocked, server-side filtered) ----------
  const loadPublic = useCallback(async () => {
    try {
      const [cats, rests, foods] = await Promise.all([
        api.get("/categories"),
        api.get("/restaurants"),
        api.get("/foods"),
      ]);
      const m = buildCategoryMaps(cats.data);
      setMaps(m);
      setPublicRestaurants(rests.data.map(normalizeRestaurant));
      setPublicFoods(foods.data.map((f) => normalizeFood(f, m.idToSlug)));
    } catch (err) {
      notify(apiErrorMessage(err, "Could not load restaurants."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPublic();
  }, [loadPublic]);

  // ---------- Restaurant owner: own restaurant + full menu ----------
  const isOwner = user?.role === "restaurant";
  const mapsReady = Object.keys(maps.idToSlug).length > 0;

  useEffect(() => {
    if (!isOwner) {
      setMyRestaurant(null);
      setMyFoods([]);
      return;
    }
    if (!mapsReady) return;

    let cancelled = false;
    api
      .get("/owner/restaurant")
      .then(({ data }) => {
        if (cancelled) return;
        const { foods = [], ...rest } = data;
        const r = { ...normalizeRestaurant(rest), owner: user.name };
        setMyRestaurant(r);
        setMyFoods(foods.map((f) => normalizeFood({ ...f, restaurantName: r.name }, maps.idToSlug)));
      })
      .catch((err) => !cancelled && notify(apiErrorMessage(err, "Could not load your restaurant.")));

    return () => {
      cancelled = true;
    };
  }, [isOwner, mapsReady, user?.name]);

  // ---------- Admin: every restaurant (pending / rejected / blocked too) ----------
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAdmin) {
      setAdminRestaurants([]);
      return;
    }
    let cancelled = false;
    api
      .get("/admin/restaurants")
      .then(({ data }) => !cancelled && setAdminRestaurants(data.map(normalizeRestaurant)))
      .catch((err) => !cancelled && notify(apiErrorMessage(err, "Could not load restaurants.")));
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const restaurants = publicRestaurants;
  const allRestaurants = isAdmin ? adminRestaurants : publicRestaurants;
  const menuItems = myFoods;
  const categories = useMemo(() => [...new Set(myFoods.map((f) => f.category))], [myFoods]);

  // ---------- Restaurant owner actions ----------
  async function updateRestaurant(patch) {
    try {
      const { data } = await api.put("/owner/restaurant", patch);
      setMyRestaurant((prev) => ({ ...prev, ...normalizeRestaurant(data), owner: prev?.owner ?? "" }));
      loadPublic();
      return OK;
    } catch (err) {
      return fail(err, "Could not update the restaurant.");
    }
  }

  async function toggleOpen() {
    if (!myRestaurant) return;
    const next = !myRestaurant.isOpen;
    setMyRestaurant((p) => ({ ...p, isOpen: next }));
    try {
      await api.put("/owner/restaurant", { isOpen: next });
      loadPublic();
    } catch (err) {
      setMyRestaurant((p) => ({ ...p, isOpen: !next }));
      notify(apiErrorMessage(err, "Could not change the restaurant status."));
    }
  }

  async function addFood(data) {
    try {
      const { data: created } = await api.post("/owner/foods", toFoodPayload(data, maps.slugToId));
      const food = normalizeFood({ ...created, restaurantName: myRestaurant?.name }, maps.idToSlug);
      setMyFoods((prev) => [...prev, food]);
      loadPublic();
      return { success: true, food };
    } catch (err) {
      return fail(err, "Could not add the food item.");
    }
  }

  async function updateFood(foodId, patch) {
    try {
      const { data: updated } = await api.put(`/owner/foods/${foodId}`, toFoodPayload(patch, maps.slugToId));
      const food = normalizeFood({ ...updated, restaurantName: myRestaurant?.name }, maps.idToSlug);
      setMyFoods((prev) => prev.map((f) => (f.id === food.id ? food : f)));
      loadPublic();
      return OK;
    } catch (err) {
      return fail(err, "Could not update the food item.");
    }
  }

  async function deleteFood(foodId) {
    try {
      await api.delete(`/owner/foods/${foodId}`);
      setMyFoods((prev) => prev.filter((f) => f.id !== foodId));
      loadPublic();
      return OK;
    } catch (err) {
      return fail(err, "Could not delete the food item.");
    }
  }

  // optimistic toggle: UI sathe sathe bodlay, server fail korle ager obosthay fire jay
  async function toggleFoodField(foodId, field) {
    const food = myFoods.find((f) => f.id === foodId);
    if (!food) return;
    const next = !food[field];
    setMyFoods((prev) => prev.map((f) => (f.id === foodId ? { ...f, [field]: next } : f)));
    try {
      await api.put(`/owner/foods/${foodId}`, { [field]: next });
      loadPublic();
    } catch (err) {
      setMyFoods((prev) => prev.map((f) => (f.id === foodId ? { ...f, [field]: !next } : f)));
      notify(apiErrorMessage(err, "Could not update the food item."));
    }
  }

  const toggleFoodAvailability = (foodId) => toggleFoodField(foodId, "isAvailable");
  const toggleFoodPopular = (foodId) => toggleFoodField(foodId, "isPopular");

  // ---------- Admin actions ----------
  async function adminPatch(id, path, body, apply) {
    const previous = adminRestaurants;
    setAdminRestaurants((prev) => prev.map((r) => (r.id === id ? { ...r, ...apply } : r)));
    try {
      await api.patch(`/admin/restaurants/${id}/${path}`, body);
      loadPublic();
    } catch (err) {
      setAdminRestaurants(previous);
      notify(apiErrorMessage(err, "Action failed."));
    }
  }

  const approveRestaurant = (id) =>
    adminPatch(id, "approval", { approvalStatus: "APPROVED" }, { approvalStatus: "APPROVED" });
  const rejectRestaurant = (id) =>
    adminPatch(id, "approval", { approvalStatus: "REJECTED" }, { approvalStatus: "REJECTED" });
  const blockRestaurant = (id) => adminPatch(id, "blocked", { blocked: true }, { blocked: true });
  const unblockRestaurant = (id) => adminPatch(id, "blocked", { blocked: false }, { blocked: false });

  const value = {
    loading,
    // Live catalog — customer-facing pages.
    restaurants,
    foods: publicFoods,
    // Full registry — Admin panel.
    allRestaurants,
    // Restaurant-panel-scoped view.
    restaurant: myRestaurant,
    menuItems,
    categories,
    isOpen: myRestaurant?.isOpen ?? false,
    updateRestaurant,
    toggleOpen,
    addFood,
    updateFood,
    deleteFood,
    toggleFoodAvailability,
    toggleFoodPopular,
    approveRestaurant,
    rejectRestaurant,
    blockRestaurant,
    unblockRestaurant,
    reload: loadPublic,
  };

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
}

export function useRestaurantData() {
  return useContext(RestaurantContext);
}