import { useState } from "react";
import { Outlet } from "react-router-dom";
import RiderSidebar from "../components/rider/RiderSidebar";
import RiderHeader from "../components/rider/RiderHeader";
import "./RiderLayout.css";

export default function RiderLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="rider-shell">
      <RiderSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="rider-shell__main">
        <RiderHeader onMenuClick={() => setSidebarOpen(true)} />
        <div className="rider-shell__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
