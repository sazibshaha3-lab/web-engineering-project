import ConfirmationDialog from "../feedback/ConfirmationDialog";

export default function AdminConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "primary",
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
      tone={tone}
    />
  );
}
