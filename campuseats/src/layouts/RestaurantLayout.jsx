import { useState } from "react";
import { Outlet } from "react-router-dom";
import RestaurantSidebar from "../components/restaurant/RestaurantSidebar";
import RestaurantHeader from "../components/restaurant/RestaurantHeader";
import "./RestaurantLayout.css";

export default function RestaurantLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="restaurant-shell">
      <RestaurantSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="restaurant-shell__main">
        <RestaurantHeader onMenuClick={() => setSidebarOpen(true)} />
        <div className="restaurant-shell__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
