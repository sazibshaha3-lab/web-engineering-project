import { useParams, useNavigate } from "react-router-dom";
import { PackageSearch } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import ErrorState from "../../components/common/ErrorState";
import PickupInfo from "../../components/rider/PickupInfo";
import CustomerDeliveryInfo from "../../components/rider/CustomerDeliveryInfo";
import RiderDeliveryTimeline from "../../components/rider/RiderDeliveryTimeline";
import DeliveryActionButtons from "../../components/rider/DeliveryActionButtons";
import OrderItems from "../../components/order/OrderItems";
import { useOrders } from "../../context/OrderContext";
import { useRider } from "../../context/RiderContext";
import { useRestaurantData } from "../../context/RestaurantContext";
import "./RiderDeliveryDetails.css";

const banners = {
  READY_FOR_PICKUP: "Head to the restaurant to collect this order",
  PICKED_UP: "Order collected — start the delivery when ready",
  OUT_FOR_DELIVERY: "On the way to the customer",
  DELIVERED: "Delivery completed",
};

export default function RiderDeliveryDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrderById } = useOrders();
  const { rider } = useRider();
  const { restaurants } = useRestaurantData();

  const order = getOrderById(orderId);

  if (!order || order.riderId !== rider.id) {
    return (
      <ErrorState
        title="Delivery not found"
        description="We couldn't find this delivery."
        onRetry={() => navigate("/rider/deliveries")}
        actionLabel="Back to Deliveries"
      />
    );
  }

  const restaurant = restaurants.find((r) => r.id === order.restaurantId);

  return (
    <div className="fade-in">
      <PageHeader icon={PackageSearch} title={order.id} description={`Total ৳${order.total}`} />

      <div className={`rdd__banner ${order.status === "DELIVERED" ? "rdd__banner--done" : ""}`}>
        {banners[order.status]}
      </div>

      <div className="rdd__grid">
        <div>
          <div className="rdd__panel">
            <h3>Restaurant pickup</h3>
            <PickupInfo restaurant={restaurant} orderId={order.id} />
          </div>

          <div className="rdd__panel">
            <h3>Customer delivery</h3>
            <CustomerDeliveryInfo address={order.deliveryAddress} instructions={order.deliveryInstructions} />
          </div>

          <div className="rdd__panel">
            <h3>Order items</h3>
            <OrderItems items={order.items} />
          </div>
        </div>

        <div>
          <div className="rdd__panel">
            <h3>Delivery status</h3>
            <RiderDeliveryTimeline status={order.status} />
          </div>

          <div className="rdd__panel">
            <h3>Payment</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", marginBottom: "var(--space-2)" }}>
              {order.paymentMethod === "online" ? "Online Payment" : "Cash on Delivery"} · {order.paymentStatus}
            </p>
          </div>

          <DeliveryActionButtons order={order} />
        </div>
      </div>
    </div>
  );
}
