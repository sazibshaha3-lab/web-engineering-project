import Button from "../common/Button";
import Modal from "../feedback/Modal";
import { useCart } from "../../context/CartContext";

export default function CartConflictDialog() {
  const { conflict, resolveConflictKeepCurrent, resolveConflictClearAndAdd } = useCart();

  return (
    <Modal
      open={!!conflict}
      onClose={resolveConflictKeepCurrent}
      title="Start a new order?"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={resolveConflictKeepCurrent}>
            Keep Current Cart
          </Button>
          <Button variant="danger" onClick={resolveConflictClearAndAdd}>
            Clear &amp; Add
          </Button>
        </>
      }
    >
      {conflict && (
        <p style={{ font: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          Your cart contains items from <strong>{conflict.currentRestaurantName}</strong>. Adding from{" "}
          <strong>{conflict.newRestaurantName}</strong> will clear your current cart and start a new order.
        </p>
      )}
    </Modal>
  );
}
