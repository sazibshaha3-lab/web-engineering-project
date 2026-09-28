import ConfirmationDialog from "../feedback/ConfirmationDialog";

export default function DeclineDeliveryDialog({ open, onClose, onConfirm }) {
  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Decline this delivery?"
      description="This delivery request will remain available for another rider."
      confirmLabel="Decline"
      cancelLabel="Keep Request"
      tone="danger"
    />
  );
}
