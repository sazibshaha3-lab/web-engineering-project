import ConfirmationDialog from "../feedback/ConfirmationDialog";

export default function BlockActionDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
}) {
  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      cancelLabel="Cancel"
      tone="danger"
    />
  );
}
