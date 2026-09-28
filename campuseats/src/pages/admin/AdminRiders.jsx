import { useEffect, useMemo, useState } from "react";
import { Bike } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import CustomerSearch from "../../components/customer/CustomerSearch";
import RiderManagementTable from "../../components/admin/RiderManagementTable";
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

export default function AdminRiders() {
  const { riders } = useAdmin();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return riders.filter((r) => {
      const matchesStatus = statusFilter === "all" || r.approvalStatus === statusFilter;
      const matchesQuery =
        !q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.phone.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [riders, query, statusFilter]);

  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 8);
  const filtersActive = query.trim() !== "" || statusFilter !== "all";

  return (
    <div className="fade-in">
      <PageHeader icon={Bike} title="Riders" description="Every delivery rider on CampusEats — approved, pending or blocked." />

      <div className="admin-toolbar">
        <div className="admin-toolbar__search">
          <CustomerSearch value={query} onChange={setQuery} placeholder="Search by name, email or phone" size="sm" />
        </div>
      </div>

      <div className="admin-tabs" role="tablist" aria-label="Filter riders by status">
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
      ) : riders.length === 0 ? (
        <AdminEmptyState icon={Bike} title="No riders yet" description="Riders will appear here once they register." />
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          icon={Bike}
          title="No riders found"
          description={filtersActive ? "Try adjusting your search or filter." : "No riders to show."}
        />
      ) : (
        <div className="dashboard-panel">
          <RiderManagementTable riders={pageItems} />
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} onChange={setPage} totalCount={filtered.length} label="riders" />
    </div>
  );
}
