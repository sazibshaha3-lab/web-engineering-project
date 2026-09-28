import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import { useAuth } from "../context/AuthContext";
import "./AdminLayout.css";

const titles = {
  "/admin": "Dashboard",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/restaurants": "Restaurants",
  "/admin/riders": "Riders",
  "/admin/profile": "Profile",
};

function resolveTitle(pathname) {
  if (titles[pathname]) return titles[pathname];
  if (pathname.startsWith("/admin/orders/")) return "Order details";
  if (pathname.startsWith("/admin/customers/")) return "Customer details";
  if (pathname.startsWith("/admin/restaurants/")) return "Restaurant details";
  if (pathname.startsWith("/admin/riders/")) return "Rider details";
  return "Admin";
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="admin-shell">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-shell__main">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          title={resolveTitle(pathname)}
          adminName={user?.name || "Platform Admin"}
        />
        <div className="admin-shell__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
