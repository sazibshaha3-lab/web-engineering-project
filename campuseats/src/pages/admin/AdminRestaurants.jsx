import { useEffect, useMemo, useState } from "react";
import { Store } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import CustomerSearch from "../../components/customer/CustomerSearch";
import RestaurantManagementTable from "../../components/admin/RestaurantManagementTable";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import AdminPagination from "../../components/admin/AdminPagination";
import { SkeletonRow } from "../../components/common/SkeletonLoader";
import { useAdmin } from "../../context/AdminContext";
import usePagination from "../../hooks/usePagination";
import "./admin-shared.css";

const statusFilters = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "BLOCKED", label: "Blocked" },
];

export default function AdminRestaurants() {
  const { allRestaurants } = useAdmin();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRestaurants.filter((r) => {
      const effectiveStatus = r.blocked ? "BLOCKED" : r.approvalStatus;
      const matchesStatus = statusFilter === "all" || effectiveStatus === statusFilter;
      const matchesQuery =
        !q || r.name.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [allRestaurants, query, statusFilter]);

  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 8);
  const filtersActive = query.trim() !== "" || statusFilter !== "all";

  return (
    <div className="fade-in">
      <PageHeader icon={Store} title="Restaurants" description="Every restaurant on CampusEats — approved, pending or blocked." />

      <div className="admin-toolbar">
        <div className="admin-toolbar__search">
          <CustomerSearch value={query} onChange={setQuery} placeholder="Search by name, owner or category" size="sm" />
        </div>
      </div>

      <div className="admin-tabs" role="tablist" aria-label="Filter restaurants by status">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={statusFilter === f.value}
            className={`admin-tabs__tab ${statusFilter === f.value ? "is-active" : ""}`}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="dashboard-panel">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : allRestaurants.length === 0 ? (
        <AdminEmptyState icon={Store} title="No restaurants yet" description="Restaurants will appear here once they register." />
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          icon={Store}
          title="No restaurants found"
          description={filtersActive ? "Try adjusting your search or filter." : "No restaurants to show."}
        />
      ) : (
        <div className="dashboard-panel">
          <RestaurantManagementTable restaurants={pageItems} />
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} onChange={setPage} totalCount={filtered.length} label="restaurants" />
    </div>
  );
}
