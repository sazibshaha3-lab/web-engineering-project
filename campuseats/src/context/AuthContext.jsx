import { createContext, useContext, useMemo, useState } from "react";
import { customerAccounts as seedCustomerAccounts } from "../data/users";

const AuthContext = createContext(null);

const DEMO_EMAIL = "demo@campuseats.test";
const DEMO_PASSWORD = "Demo123!";
const DEMO_OTP = "123456";

const RESTAURANT_EMAIL = "restaurant@campuseats.test";
const RESTAURANT_PASSWORD = "Restaurant123!";

const RIDER_EMAIL = "rider@campuseats.test";
const RIDER_PASSWORD = "Rider123!";

const ADMIN_EMAIL = "admin@campuseats.test";
const ADMIN_PASSWORD = "Admin123!";

// The live demo customer's account row in the shared customer registry
// (data/users.js -> customerAccounts). Used to gate login when Admin
// blocks this account.
const DEMO_CUSTOMER_ID = "u1";

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
  const [pendingSignup, setPendingSignup] = useState(null);
  // Customer account registry — single source of truth for both the
  // Admin Customers panel and login-time block enforcement. Nothing
  // else in the app should keep its own copy of this list.
  const [customers, setCustomers] = useState(seedCustomerAccounts);

  function loginMock(email, password) {
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setUser({ name: "Platform Admin", email: ADMIN_EMAIL, role: "admin", phone: "+880 1XXX-XXXXXX" });
      return { success: true, role: "admin" };
    }

    if (normalizedEmail === RESTAURANT_EMAIL && password === RESTAURANT_PASSWORD) {
      setUser({ name: "Campus Grill House", email: RESTAURANT_EMAIL, role: "restaurant" });
      return { success: true, role: "restaurant" };
    }

    if (normalizedEmail === RIDER_EMAIL && password === RIDER_PASSWORD) {
      setUser({ name: "Rahim Ahmed", email: RIDER_EMAIL, role: "rider" });
      return { success: true, role: "rider" };
    }

    if (normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const account = customers.find((c) => c.id === DEMO_CUSTOMER_ID);
      if (account?.status === "blocked") {
        return { success: false, message: "This account has been blocked. Contact CampusEats support for help." };
      }
      setUser({ name: account?.name || "Alex", email: DEMO_EMAIL, role: "customer" });
      return { success: true, role: "customer" };
    }

    return { success: false, message: "Invalid email or password." };
  }

  function startRegistration({ name, email, phone }) {
    setPendingSignup({
      name,
      maskedEmail: maskEmail(email),
      maskedPhone: maskPhone(phone),
    });
  }

  function verifyOtpMock(code) {
    if (code === DEMO_OTP) {
      setUser({ name: pendingSignup?.name || "Alex", email: pendingSignup?.maskedEmail || DEMO_EMAIL, role: "customer" });
      setPendingSignup(null);
      return { success: true };
    }
    return { success: false, message: "Incorrect verification code. Please try again." };
  }

  function logoutMock() {
    setUser(null);
  }

  function updateAdminProfile(patch) {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  function blockCustomer(id) {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, status: "blocked" } : c)));
  }

  function unblockCustomer(id) {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, status: "active" } : c)));
  }

  const value = useMemo(
    () => ({
      user,
      pendingSignup,
      loginMock,
      startRegistration,
      verifyOtpMock,
      logoutMock,
      updateAdminProfile,
      customers,
      blockCustomer,
      unblockCustomer,
    }),
    [user, pendingSignup, customers]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
