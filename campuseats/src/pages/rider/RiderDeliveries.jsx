import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bike } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import DeliveryRequestCard from "../../components/rider/DeliveryRequestCard";
import DeclineDeliveryDialog from "../../components/rider/DeclineDeliveryDialog";
import RiderEmptyState from "../../components/rider/RiderEmptyState";
import { useRider } from "../../context/RiderContext";
import { useRestaurantData } from "../../context/RestaurantContext";
import { useToast } from "../../components/feedback/ToastContext";

export default function RiderDeliveries() {
  const navigate = useNavigate();
  const toast = useToast();
  const { rider, isAvailable, getAvailableDeliveries, acceptDelivery, rejectDelivery } = useRider();
  const { restaurants } = useRestaurantData();
  const [decliningId, setDecliningId] = useState(null);

  const requests = getAvailableDeliveries();
  const isApproved = rider.approvalStatus === "APPROVED";

  function handleAccept(orderId) {
    const result = acceptDelivery(orderId);
    if (result.success) {
      toast?.showToast("Delivery accepted", "success");
      navigate(`/rider/deliveries/${orderId}`);
    } else {
      toast?.showToast(result.message, "error");
    }
    return result.success;
  }

  function handleConfirmDecline() {
    rejectDelivery(decliningId);
    setDecliningId(null);
    toast?.showToast("Delivery declined", "info");
  }

  let notice = null;
  if (!isApproved) {
    notice = "Your rider account is not approved for deliveries.";
  } else if (!isAvailable) {
    notice = "You are unavailable for new deliveries.";
  }

  return (
    <div className="fade-in">
      <PageHeader icon={Bike} title="Deliveries" description="Accept delivery requests ready for pickup." />

      {notice && (
        <p style={{ background: "var(--color-warning-tint)", color: "var(--color-warning)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-6)", fontSize: "0.88rem" }}>
          {notice}
        </p>
      )}

      {requests.length === 0 ? (
        <RiderEmptyState
          icon={Bike}
          title="No delivery requests"
          description="New delivery requests will appear here when orders are ready for pickup."
        />
      ) : (
        requests.map((order) => (
          <DeliveryRequestCard
            key={order.id}
            order={order}
            restaurant={restaurants.find((r) => r.id === order.restaurantId)}
            onAccept={handleAccept}
            onDecline={setDecliningId}
          />
        ))
      )}

      <DeclineDeliveryDialog
        open={!!decliningId}
        onClose={() => setDecliningId(null)}
        onConfirm={handleConfirmDecline}
      />
    </div>
  );
}
