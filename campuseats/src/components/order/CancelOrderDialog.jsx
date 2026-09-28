import ConfirmationDialog from "../feedback/ConfirmationDialog";

export default function CancelOrderDialog({ open, onClose, onConfirm }) {
  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Cancel this order?"
      description="Are you sure you want to cancel this order?"
      confirmLabel="Cancel Order"
      cancelLabel="Keep Order"
      tone="danger"
    />
  );
}
