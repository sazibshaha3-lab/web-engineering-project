import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar";
import Topbar from "../components/navigation/Topbar";
import "./DashboardLayout.css";

export default function DashboardLayout({ sections, title, userName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <Sidebar sections={sections} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-shell__main">
        <Topbar title={title} userName={userName} onMenuClick={() => setSidebarOpen(true)} />
        <div className="dashboard-shell__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
