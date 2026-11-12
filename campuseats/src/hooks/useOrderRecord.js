import { useCallback, useEffect, useState } from "react";
import { useOrders } from "../context/OrderContext";

export default function useOrderRecord(orderNumber) {
  const { getOrderById, loadOrderByNumber } = useOrders();
  const order = getOrderById(orderNumber);
  const [loading, setLoading] = useState(Boolean(orderNumber));
  const [error, setError] = useState(null);

  const retry = useCallback(async () => {
    if (!orderNumber) return;
    setLoading(true);
    setError(null);
    const result = await loadOrderByNumber(orderNumber);
    if (!result.success) setError(result.message);
    setLoading(false);
  }, [loadOrderByNumber, orderNumber]);

  useEffect(() => {
    if (order) {
      setLoading(false);
      setError(null);
      return;
    }
    retry();
  }, [order?.id, retry]);

  return { order, loading: !order && loading, error, retry };
}
