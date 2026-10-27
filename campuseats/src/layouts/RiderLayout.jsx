import { useState } from "react";
import { Outlet } from "react-router-dom";
import RiderSidebar from "../components/rider/RiderSidebar";
import RiderHeader from "../components/rider/RiderHeader";
import { useRider } from "../context/RiderContext";
import "./RiderLayout.css";

export default function RiderLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { rider } = useRider();

  // Rider data comes from /me; wait for it before rendering pages that read `rider.*`
  if (!rider) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "var(--color-text-muted)" }}>
        Loading your rider profile...
      </div>
    );
  }

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
