import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import Button from "../common/Button";
import { useOrders } from "../../context/OrderContext";
import { useToast } from "../feedback/ToastContext";

export default function ReorderButton({ orderId, restaurantId, variant = "primary", size = "md", fullWidth = false }) {
  const { reorder } = useOrders();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  function handleReorder() {
    setLoading(true);
    setTimeout(() => {
      const result = reorder(orderId);
      setLoading(false);

      if (!result.success && result.allUnavailable) {
        toast?.showToast("None of the previous items are currently available.", "error");
        navigate(`/customer/restaurant/${restaurantId}`);
        return;
      }

      if (!result.success) {
        toast?.showToast("This order can't be reordered right now.", "error");
        return;
      }

      if (result.unavailableCount > 0) {
        toast?.showToast("Some items are unavailable. We added the rest to your cart.", "info");
      } else {
        toast?.showToast("Added your previous order to the cart.", "success");
      }
      navigate("/customer/cart");
    }, 500);
  }

  return (
    <Button variant={variant} size={size} fullWidth={fullWidth} icon={RotateCcw} loading={loading} onClick={handleReorder}>
      Reorder
    </Button>
  );
}
