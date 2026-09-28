import { ClipboardList } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import AdminStats from "../../components/admin/AdminStats";
import AdminQuickActions from "../../components/admin/AdminQuickActions";
import AdminActivity from "../../components/admin/AdminActivity";
import AdminOrderTable from "../../components/admin/AdminOrderTable";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import { useAdmin } from "../../context/AdminContext";
import "./admin-shared.css";

export default function AdminDashboard() {
  const { recentOrders } = useAdmin();

  return (
    <div className="fade-in">
      <PageHeader title="Platform overview" description="A snapshot of CampusEats activity right now." />

      <AdminStats />
      <AdminQuickActions />

      <div className="admin-dashboard__grid">
        <div className="dashboard-panel">
          <h3 style={{ font: "var(--text-card-title)", marginBottom: "var(--space-4)" }}>Recent orders</h3>
          {recentOrders.length === 0 ? (
            <AdminEmptyState icon={ClipboardList} title="No orders yet" description="Orders placed by customers will appear here." />
          ) : (
            <AdminOrderTable orders={recentOrders} />
          )}
        </div>

        <AdminActivity />
      </div>
    </div>
  );
}
