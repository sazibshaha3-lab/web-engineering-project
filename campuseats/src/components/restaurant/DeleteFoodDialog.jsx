import ConfirmationDialog from "../feedback/ConfirmationDialog";

export default function DeleteFoodDialog({ open, onClose, onConfirm }) {
  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete this food item?"
      description="This food item will no longer appear on your menu."
      confirmLabel="Delete Item"
      cancelLabel="Keep Item"
      tone="danger"
    />
  );
}
