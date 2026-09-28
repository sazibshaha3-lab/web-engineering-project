import { savedLocations } from "./locations";

export const currentCustomer = {
  id: "u1",
  name: "Sazib Rahman",
  email: "sazib.rahman@campus.edu",
  phone: "+880 1XXX-XXXXXX",
  avatar: null,
  savedLocations,
};

export const currentRestaurantOwner = {
  id: "ro1",
  restaurantName: "Campus Grill House",
  ownerName: "Imran Hossain",
  status: "approved",
};

export const admins = [
  { id: "a1", name: "Platform Admin", email: "admin@campuseats.test", role: "Super Admin", avatar: null },
];

// Customer account registry — single source of truth for the Admin
// Customers panel and for login-time block checks in AuthContext.
// "u1" is the live demo customer (matches AuthContext -> DEMO_EMAIL /
// currentCustomer above).
export const customerAccounts = [
  { id: "u1", name: "Sazib Rahman", email: "demo@campuseats.test", phone: "+880 1XXX-XXXXXX", orders: 24, status: "active" },
  { id: "u2", name: "Farhana Akter", email: "farhana.akter@campus.edu", phone: "+880 1XXX-XXXXXX", orders: 11, status: "active" },
  { id: "u3", name: "Rakibul Islam", email: "rakibul.islam@campus.edu", phone: "+880 1XXX-XXXXXX", orders: 3, status: "inactive" },
  { id: "u4", name: "Mehjabin Chowdhury", email: "mehjabin.c@campus.edu", phone: "+880 1XXX-XXXXXX", orders: 46, status: "active" },
];
