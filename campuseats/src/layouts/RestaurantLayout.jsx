import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useRestaurantData } from "../context/RestaurantContext";
import RestaurantSidebar from "../components/restaurant/RestaurantSidebar";
import RestaurantHeader from "../components/restaurant/RestaurantHeader";
import "./RestaurantLayout.css";

export default function RestaurantLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { restaurant } = useRestaurantData();

  if (!restaurant) return <div className="restaurant-shell__content">Loading restaurant...</div>;

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
