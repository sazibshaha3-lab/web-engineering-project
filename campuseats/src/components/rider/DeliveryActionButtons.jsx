import { useState } from "react";
import { PackageCheck, Truck, CheckCircle2 } from "lucide-react";
import Button from "../common/Button";
import ConfirmationDialog from "../feedback/ConfirmationDialog";
import { useRider } from "../../context/RiderContext";
import { useToast } from "../feedback/ToastContext";
import "./DeliveryActionButtons.css";

export default function DeliveryActionButtons({ order }) {
  const { markPickedUp, startDelivery, markDelivered } = useRider();
  const toast = useToast();
  const [pickupOpen, setPickupOpen] = useState(false);
  const [deliveredOpen, setDeliveredOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleConfirmPickup() {
    setPickupOpen(false);
    setLoading(true);
    setTimeout(() => {
      const result = markPickedUp(order.id);
      setLoading(false);
      if (result.success) toast?.showToast("Order picked up", "success");
    }, 500);
  }

  function handleStartDelivery() {
    setLoading(true);
    setTimeout(() => {
      const result = startDelivery(order.id);
      setLoading(false);
      if (result.success) toast?.showToast("Delivery started", "success");
    }, 500);
  }

  function handleConfirmDelivered() {
    setDeliveredOpen(false);
    setLoading(true);
    setTimeout(() => {
      const result = markDelivered(order.id);
      setLoading(false);
      if (result.success) toast?.showToast("Delivery completed", "success");
    }, 500);
  }

  if (order.status === "READY_FOR_PICKUP") {
    return (
      <>
        <div className="delivery-actions">
          <Button fullWidth icon={PackageCheck} loading={loading} onClick={() => setPickupOpen(true)}>
            Pick Up Order
          </Button>
        </div>
        <ConfirmationDialog
          open={pickupOpen}
          onClose={() => setPickupOpen(false)}
          onConfirm={handleConfirmPickup}
          title="Confirm pickup"
          description="Confirm that you have collected this order from the restaurant."
          confirmLabel="Confirm Pickup"
          cancelLabel="Not Yet"
        />
      </>
    );
  }

  if (order.status === "PICKED_UP") {
    return (
      <div className="delivery-actions">
        <Button fullWidth icon={Truck} loading={loading} onClick={handleStartDelivery}>
          Start Delivery
        </Button>
      </div>
    );
  }

  if (order.status === "OUT_FOR_DELIVERY") {
    return (
      <>
        <div className="delivery-actions">
          <Button fullWidth icon={CheckCircle2} loading={loading} onClick={() => setDeliveredOpen(true)}>
            Mark Delivered
          </Button>
        </div>
        <ConfirmationDialog
          open={deliveredOpen}
          onClose={() => setDeliveredOpen(false)}
          onConfirm={handleConfirmDelivered}
          title="Complete this delivery?"
          description="Confirm that the order has been delivered to the customer."
          confirmLabel="Mark Delivered"
          cancelLabel="Not Yet"
        />
      </>
    );
  }

  return null;
}
