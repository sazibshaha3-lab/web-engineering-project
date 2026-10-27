import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { apiErrorMessage, getToken, setToken } from "../services/api";
import { normalizeCustomer } from "../services/peopleApi";

const AuthContext = createContext(null);
const PENDING_SIGNUP_KEY = "campuseats_pending_signup";

function readPendingSignup() {
  try {
    return JSON.parse(sessionStorage.getItem(PENDING_SIGNUP_KEY) || "null");
  } catch {
    return null;
  }
}

// Backend role -> frontend role
const ROLE_MAP = { restaurant_owner: "restaurant" };
const toFrontendUser = (u) => ({ ...u, role: ROLE_MAP[u.role] ?? u.role });

function maskEmail(email) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const visible = name.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(name.length - 2, 2))}@${domain}`;
}

function maskPhone(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone;
  return `${phone.slice(0, 4)} ${"*".repeat(Math.max(digits.length - 6, 3))} ${digits.slice(-2)}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(() => Boolean(getToken()));
  const [pendingSignup, setPendingSignup] = useState(readPendingSignup);
  // Admin Customers panel: real list from /admin/customers (loaded when an admin is logged in)
  const [customers, setCustomers] = useState([]);

  // Restore the session after a page refresh when a token exists
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    api
      .get("/me")
      .then(({ data }) => {
        if (!cancelled) setUser(toFrontendUser(data));
      })
      .catch(() => setToken(null))
      .finally(() => {
        if (!cancelled) setAuthLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto logout when the token expires or is revoked (401)
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  // Admin: customers list
  const isAdmin = user?.role === "admin";
  useEffect(() => {
    if (!isAdmin) {
      setCustomers([]);
      return;
    }
    let cancelled = false;
    api
      .get("/admin/customers")
      .then(({ data }) => !cancelled && setCustomers(data.map(normalizeCustomer)))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  // Re-fetch /me so the user (and their rider/restaurant record) is fresh, e.g. a rider's totalDeliveries
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get("/me");
      setUser(toFrontendUser(data));
    } catch {
      // ignore: on 401 the interceptor logs the user out
    }
  }, []);

  const updateProfile = useCallback(async (patch) => {
    try {
      const { data } = await api.put("/me", { name: patch.name, phone: patch.phone });
      setUser(toFrontendUser(data));
      return { success: true };
    } catch (err) {
      return { success: false, message: apiErrorMessage(err, "Could not update your profile.") };
    }
  }, []);

  async function loginMock(email, password) {
    try {
      const { data } = await api.post("/login", { email: email.trim().toLowerCase(), password });
      setToken(data.token);
      const u = toFrontendUser(data.user);
      setUser(u);
      return { success: true, role: u.role };
    } catch (err) {
      return { success: false, message: apiErrorMessage(err, "Invalid email or password.") };
    }
  }

  const loginWithGoogle = useCallback(async (credential) => {
    try {
      const { data } = await api.post("/login/google", { credential });
      setToken(data.token);
      const u = toFrontendUser(data.user);
      setUser(u);
      return { success: true, role: u.role };
    } catch (err) {
      return { success: false, message: apiErrorMessage(err, "Google sign-in failed. Please try again.") };
    }
  }, []);

  async function startRegistration({
    name, email, phone, password, role = "customer", restaurantName,
    restaurantAddress, vehicleType, vehicleNumber, adminInviteCode,
  }) {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      await api.post("/register/send-otp", {
        name, email: normalizedEmail, phone, password, role,
        restaurantName, restaurantAddress, vehicleType, vehicleNumber, adminInviteCode,
      });
    } catch (err) {
      return { success: false, message: apiErrorMessage(err, "Could not send the verification email. Please try again.") };
    }
    const signup = {
      email: normalizedEmail,
      maskedEmail: maskEmail(email),
      maskedPhone: maskPhone(phone),
    };
    setPendingSignup(signup);
    try { sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(signup)); } catch { /* session storage may be unavailable */ }
    return { success: true };
  }

  async function verifyOtpMock(code) {
    if (!pendingSignup) {
      return { success: false, message: "Your signup session expired. Please register again." };
    }
    try {
      const { email } = pendingSignup;
      await api.post("/register/verify-otp", { email, code });
      const { data } = await api.post("/register", { email });
      setToken(data.token);
      setUser(toFrontendUser(data.user));
      setPendingSignup(null);
      sessionStorage.removeItem(PENDING_SIGNUP_KEY);
      return { success: true, role: toFrontendUser(data.user).role };
    } catch (err) {
      return { success: false, message: apiErrorMessage(err, "Could not create your account.") };
    }
  }

  async function resendRegistrationOtp() {
    if (!pendingSignup) return { success: false, message: "Your signup session expired. Please register again." };
    try {
      await api.post("/register/send-otp", { email: pendingSignup.email });
      return { success: true };
    } catch (err) {
      return { success: false, message: apiErrorMessage(err, "Could not resend the verification email.") };
    }
  }

  function logoutMock() {
    const token = getToken();
    if (token) {
      api.post("/logout", null, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    }
    setToken(null);
    setUser(null);
  }

  function updateAdminProfile(patch) {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  // Optimistic: the UI changes immediately and rolls back if the server rejects it.
  async function setCustomerStatus(id, status) {
    const previous = customers;
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    try {
      await api.patch(`/admin/customers/${id}/status`, { status });
      return { success: true };
    } catch (err) {
      setCustomers(previous);
      return { success: false, message: apiErrorMessage(err, "Could not update the customer.") };
    }
  }

  const blockCustomer = (id) => setCustomerStatus(id, "blocked");
  const unblockCustomer = (id) => setCustomerStatus(id, "active");

  const value = useMemo(
    () => ({
      user,
      authLoading,
      pendingSignup,
      loginMock,
      loginWithGoogle,
      startRegistration,
      resendRegistrationOtp,
      verifyOtpMock,
      logoutMock,
      updateAdminProfile,
      refreshUser,
      updateProfile,
      customers,
      blockCustomer,
      unblockCustomer,
    }),
    [user, authLoading, pendingSignup, customers, refreshUser, updateProfile, loginWithGoogle]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
