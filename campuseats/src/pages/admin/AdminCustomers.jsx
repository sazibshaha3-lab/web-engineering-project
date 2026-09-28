import { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import CustomerSearch from "../../components/customer/CustomerSearch";
import CustomerManagementTable from "../../components/admin/CustomerManagementTable";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import AdminPagination from "../../components/admin/AdminPagination";
import { SkeletonRow } from "../../components/common/SkeletonLoader";
import { useAdmin } from "../../context/AdminContext";
import usePagination from "../../hooks/usePagination";
import "./admin-shared.css";

const statusFilters = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "blocked", label: "Blocked" },
];

export default function AdminCustomers() {
  const { customers, blockCustomer, unblockCustomer } = useAdmin();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesQuery =
        !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [customers, query, statusFilter]);

  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 8);
  const filtersActive = query.trim() !== "" || statusFilter !== "all";

  return (
    <div className="fade-in">
      <PageHeader icon={Users} title="Customers" description="Everyone who has created a CampusEats account." />

      <div className="admin-toolbar">
        <div className="admin-toolbar__search">
          <CustomerSearch value={query} onChange={setQuery} placeholder="Search by name, email or phone" size="sm" />
        </div>
      </div>

      <div className="admin-tabs" role="tablist" aria-label="Filter customers by status">
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
      ) : customers.length === 0 ? (
        <AdminEmptyState icon={Users} title="No customers yet" description="Customer accounts will appear here as people sign up." />
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title="No customers found"
          description={filtersActive ? "Try adjusting your search or filter." : "No customer accounts to show."}
        />
      ) : (
        <div className="dashboard-panel">
          <CustomerManagementTable customers={pageItems} onBlock={blockCustomer} onUnblock={unblockCustomer} />
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} onChange={setPage} totalCount={filtered.length} label="customers" />
    </div>
  );
}
