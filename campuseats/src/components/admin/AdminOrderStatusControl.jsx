import { useState } from "react";
import { ArrowRightCircle, Ban, XCircle } from "lucide-react";
import Button from "../common/Button";
import AdminConfirmDialog from "./AdminConfirmDialog";
import { useToast } from "../feedback/ToastContext";
import { useAdmin } from "../../context/AdminContext";
import useGuardedAction from "../../hooks/useGuardedAction";

// Mirrors OrderContext's own ALLOWED_TRANSITIONS map — Admin never
// invents a parallel state machine, it just drives the same one the
// restaurant/rider already use, with confirmation + guard rails.
const NEXT_STATUS = {
  PLACED: { status: "ACCEPTED", label: "Mark as Accepted" },
  ACCEPTED: { status: "PREPARING", label: "Mark as Preparing" },
  PREPARING: { status: "READY_FOR_PICKUP", label: "Mark as Ready for Pickup" },
  READY_FOR_PICKUP: { status: "PICKED_UP", label: "Mark as Picked Up" },
  PICKED_UP: { status: "OUT_FOR_DELIVERY", label: "Mark as Out for Delivery" },
  OUT_FOR_DELIVERY: { status: "DELIVERED", label: "Mark as Delivered" },
};

export default function AdminOrderStatusControl({ order }) {
  const { updateOrderStatus, cancelOrder } = useAdmin();
  const toast = useToast();
  const { busyKey, run } = useGuardedAction();
  const [confirmNext, setConfirmNext] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);

  const next = NEXT_STATUS[order.status];
  const canCancel = order.status === "PLACED";
  const canReject = order.status === "PLACED";

  function handleAdvance() {
    setConfirmNext(false);
    run("advance", () => {
      const result = updateOrderStatus(order.id, next.status);
      toast?.showToast(
        result.success ? `Order updated to ${next.status.replace(/_/g, " ").toLowerCase()}.` : "That status change is no longer valid.",
        result.success ? "success" : "error"
      );
    });
  }

  function handleCancel() {
    setConfirmCancel(false);
    run("cancel", () => {
      const result = cancelOrder(order.id);
      toast?.showToast(
        result.success ? "Order cancelled." : "This order can no longer be cancelled.",
        result.success ? "success" : "error"
      );
    });
  }

  function handleReject() {
    setConfirmReject(false);
    run("reject", () => {
      const result = updateOrderStatus(order.id, "REJECTED");
      toast?.showToast(result.success ? "Order rejected." : "This order can no longer be rejected.", result.success ? "success" : "error");
    });
  }

  if (!next && !canCancel && !canReject) return null;

  return (
    <div className="approval-actions">
      {next && (
        <Button icon={ArrowRightCircle} loading={busyKey === "advance"} onClick={() => setConfirmNext(true)}>
          {next.label}
        </Button>
      )}
      {canReject && (
        <Button variant="danger" icon={XCircle} loading={busyKey === "reject"} onClick={() => setConfirmReject(true)}>
          Reject Order
        </Button>
      )}
      {canCancel && (
        <Button variant="secondary" icon={Ban} loading={busyKey === "cancel"} onClick={() => setConfirmCancel(true)}>
          Cancel Order
        </Button>
      )}

      <AdminConfirmDialog
        open={confirmNext}
        onClose={() => setConfirmNext(false)}
        onConfirm={handleAdvance}
        title="Update order status?"
        description={next ? `This will move ${order.id} to "${next.status.replace(/_/g, " ")}". This action reflects instantly for the customer, restaurant and rider.` : ""}
        confirmLabel="Update Status"
      />
      <AdminConfirmDialog
        open={confirmReject}
        onClose={() => setConfirmReject(false)}
        onConfirm={handleReject}
        title="Reject this order?"
        description={`${order.id} will be marked as rejected and will not proceed further.`}
        confirmLabel="Reject Order"
        tone="danger"
      />
      <AdminConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={handleCancel}
        title="Cancel this order?"
        description={`${order.id} will be marked as cancelled and cannot be resumed.`}
        confirmLabel="Cancel Order"
        tone="danger"
      />
    </div>
  );
}
