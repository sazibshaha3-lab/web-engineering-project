import Pagination from "../common/Pagination";

export default function AdminPagination({ page, totalPages, onChange, totalCount, label = "results" }) {
  if (totalCount === 0) return null;
  return (
    <div className="admin-pagination-row">
      <p className="admin-pagination-row__count">
        {totalCount} {label}
      </p>
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={onChange} />}
    </div>
  );
}
