import { useEffect, useMemo, useState } from "react";

// Lightweight client-side pagination for Admin list pages. Resets to
// page 1 whenever the filtered item count changes (new search/filter).
export default function usePagination(items, pageSize = 8) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [items.length]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const safePage = Math.min(page, totalPages);

  return { page: safePage, setPage, totalPages, pageItems };
}
