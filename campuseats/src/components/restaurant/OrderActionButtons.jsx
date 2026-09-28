import { useState } from "react";
import { CheckCircle2, XCircle, ChefHat, PackageCheck, Truck, Loader2 } from "lucide-react";
import Button from "../common/Button";
import ConfirmationDialog from "../feedback/ConfirmationDialog";
import { useOrders } from "../../context/OrderContext";
import { useToast } from "../feedback/ToastContext";
import "./OrderActionButtons.css";

const waitingCopy = {
  READY_FOR_PICKUP: "Waiting for Rider",
  PICKED_UP: "Order Picked Up",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
};

export default function OrderActionButtons({ order }) {
  const { updateOrderStatus } = useOrders();
  const toast = useToast();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);

  const busy = loadingAction !== null;

  function runTransition(nextStatus, successMessage, actionKey) {
    if (busy) return;
    setLoadingAction(actionKey);
    setTimeout(() => {
      const result = updateOrderStatus(order.id, nextStatus);
      setLoadingAction(null);
      if (result.success) {
        toast?.showToast(successMessage, "success");
      } else {
        toast?.showToast("This order can no longer be updated that way.", "error");
      }
    }, 500);
  }

  function handleReject() {
    setRejectOpen(false);
    runTransition("REJECTED", "Order rejected", "reject");
  }

  if (order.status === "PLACED") {
    return (
      <>
        <div className="order-actions">
          <Button
            icon={CheckCircle2}
            loading={loadingAction === "accept"}
            disabled={busy}
            onClick={() => runTransition("ACCEPTED", "Order accepted", "accept")}
          >
            Accept Order
          </Button>
          <Button variant="danger" icon={XCircle} disabled={busy} onClick={() => setRejectOpen(true)}>
            Reject Order
          </Button>
        </div>
        <ConfirmationDialog
          open={rejectOpen}
          onClose={() => setRejectOpen(false)}
          onConfirm={handleReject}
          title="Reject this order?"
          description="Are you sure you want to reject this order?"
          confirmLabel="Reject Order"
          cancelLabel="Keep Order"
          tone="danger"
        />
      </>
    );
  }

  if (order.status === "ACCEPTED") {
    return (
      <div className="order-actions">
        <Button
          icon={ChefHat}
          loading={loadingAction === "preparing"}
          onClick={() => runTransition("PREPARING", "Order is now being prepared", "preparing")}
        >
          Start Preparing
        </Button>
      </div>
    );
  }

  if (order.status === "PREPARING") {
    return (
      <div className="order-actions">
        <Button
          icon={PackageCheck}
          loading={loadingAction === "ready"}
          onClick={() => runTransition("READY_FOR_PICKUP", "Order is ready for pickup", "ready")}
        >
          Mark Ready for Pickup
        </Button>
      </div>
    );
  }

  const Icon = order.status === "OUT_FOR_DELIVERY" ? Truck : Loader2;
  const label = waitingCopy[order.status];

  if (label) {
    return (
      <div className="order-actions">
        <span className="order-actions__waiting">
          <Icon size={16} strokeWidth={2} />
          {label}
        </span>
      </div>
    );
  }

  return null;
}
