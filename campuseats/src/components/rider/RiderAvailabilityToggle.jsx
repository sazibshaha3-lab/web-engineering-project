import { AlertTriangle } from "lucide-react";
import Switch from "../common/Switch";
import { useRider } from "../../context/RiderContext";
import { useToast } from "../feedback/ToastContext";
import "./RiderAvailabilityToggle.css";

export default function RiderAvailabilityToggle() {
  const { rider, isAvailable, setAvailability } = useRider();
  const toast = useToast();
  const isApproved = rider.approvalStatus === "APPROVED";

  async function handleToggle(nextAvailability) {
    const result = await setAvailability(nextAvailability);
    toast?.showToast(
      result.success
        ? (nextAvailability ? "You are now available for deliveries" : "You are now unavailable")
        : result.message,
      result.success ? "success" : "error"
    );
  }

  if (!isApproved) {
    return (
      <div className="ravail-toggle__notice">
        <AlertTriangle size={16} strokeWidth={2} />
        Your rider account is not approved yet.
      </div>
    );
  }

  return (
    <div className={`ravail-toggle ${isAvailable ? "ravail-toggle--on" : "ravail-toggle--off"}`}>
      <div>
        <p className="ravail-toggle__title">
          <span className="ravail-toggle__dot" />
          {isAvailable ? "Available for Delivery" : "Unavailable"}
        </p>
        <p className="ravail-toggle__desc">
          {isAvailable
            ? "New delivery requests will be visible to you."
            : "You won't see new delivery requests, but your active delivery stays open."}
        </p>
      </div>
      <Switch checked={isAvailable} onChange={handleToggle} label="Toggle availability for delivery" />
    </div>
  );
}
