import { useEffect, useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import CustomerSearch from "../../components/customer/CustomerSearch";
import AdminOrderFilters from "../../components/admin/AdminOrderFilters";
import AdminOrderTable from "../../components/admin/AdminOrderTable";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import AdminPagination from "../../components/admin/AdminPagination";
import { SkeletonRow } from "../../components/common/SkeletonLoader";
import { useAdmin } from "../../context/AdminContext";
import { currentCustomer } from "../../data/users";
import usePagination from "../../hooks/usePagination";
import "./admin-shared.css";

export default function AdminOrders() {
  const { orders, riders } = useAdmin();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .filter((o) => {
        const matchesTab = tab === "all" || o.status === tab;
        const riderName = riders.find((r) => r.id === o.riderId)?.name || "";
        const matchesQuery =
          !q ||
          o.id.toLowerCase().includes(q) ||
          o.restaurantName.toLowerCase().includes(q) ||
          currentCustomer.name.toLowerCase().includes(q) ||
          riderName.toLowerCase().includes(q);
        return matchesTab && matchesQuery;
      });
  }, [orders, tab, query, riders]);

  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 8);

  return (
    <div className="fade-in">
      <PageHeader icon={ClipboardList} title="Orders" description="Every order placed on CampusEats, across every restaurant." />

      <div className="admin-toolbar">
        <div className="admin-toolbar__search">
          <CustomerSearch
            value={query}
            onChange={setQuery}
            placeholder="Search by order ID, customer, restaurant or rider"
            size="sm"
          />
        </div>
      </div>

      <AdminOrderFilters value={tab} onChange={setTab} />

      {loading ? (
        <div className="dashboard-panel">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : orders.length === 0 ? (
        <AdminEmptyState icon={ClipboardList} title="No orders yet" description="Orders placed by customers will appear here." />
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          icon={ClipboardList}
          title="No orders found"
          description="Try a different search term or status filter."
        />
      ) : (
        <div className="dashboard-panel">
          <AdminOrderTable orders={pageItems} />
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} onChange={setPage} totalCount={filtered.length} label="orders" />
    </div>
  );
}
