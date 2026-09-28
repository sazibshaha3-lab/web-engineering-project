import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Star, MapPin as RouteIcon } from "lucide-react";
import ErrorState from "../../components/common/ErrorState";
import Button from "../../components/common/Button";
import ImageWithFallback from "../../components/common/ImageWithFallback";
import OrderStatusBadge from "../../components/order/OrderStatusBadge";
import OrderItems from "../../components/order/OrderItems";
import OrderSummary from "../../components/order/OrderSummary";
import DeliveryInfo from "../../components/order/DeliveryInfo";
import RiderInfo from "../../components/order/RiderInfo";
import ReorderButton from "../../components/order/ReorderButton";
import CancelOrderDialog from "../../components/order/CancelOrderDialog";
import RatingReview from "../../components/order/RatingReview";
import { useOrders } from "../../context/OrderContext";
import { useRestaurantData } from "../../context/RestaurantContext";
import { useToast } from "../../components/feedback/ToastContext";
import { liveOrderStatusMap, isLiveOrderActive } from "../../utils/statusMaps";
import "./OrderDetails.css";

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { getOrderById, cancelOrder } = useOrders();
  const { restaurants } = useRestaurantData();
  const [cancelOpen, setCancelOpen] = useState(false);

  const order = getOrderById(orderId);

  if (!order) {
    return (
      <ErrorState
        title="Order not found"
        description="We couldn't find this order. It may no longer be available."
        onRetry={() => navigate("/customer/orders")}
        actionLabel="Back to Orders"
      />
    );
  }

  const restaurant = restaurants.find((r) => r.id === order.restaurantId);
  const statusMeta = liveOrderStatusMap[order.status];
  const showRider = order.status === "PICKED_UP" || order.status === "OUT_FOR_DELIVERY";
  const canCancel = order.status === "PLACED";
  const canReorder = order.status === "DELIVERED";
  const canRate = order.status === "DELIVERED";
  const canTrack = isLiveOrderActive(order.status);

  function handleConfirmCancel() {
    const result = cancelOrder(order.id);
    setCancelOpen(false);
    if (result.success) {
      toast?.showToast("Order cancelled", "info");
    } else {
      toast?.showToast("This order can no longer be cancelled.", "error");
    }
  }

  return (
    <div className="fade-in">
      <div className="order-details__header">
        <Link to="/customer/orders" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
          <ArrowLeft size={16} strokeWidth={2} /> Back to Orders
        </Link>
        <OrderStatusBadge status={order.status} />
      </div>

      <h1 style={{ font: "var(--text-h2)", marginBottom: "4px" }}>{order.id}</h1>
      <p className="order-details__meta" style={{ marginBottom: "var(--space-5)" }}>
        {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
      </p>

      <div className={`order-details__banner order-details__banner--${statusMeta.tone}`}>
        {statusMeta.banner}
      </div>

      <div className="order-details__grid">
        <div>
          <div className="order-details__section">
            <h3 className="order-details__section-title">Restaurant</h3>
            <div className="order-details__restaurant">
              <span className="order-details__restaurant-logo">
                <ImageWithFallback src={order.restaurantLogo} alt={order.restaurantName} ratio="1 / 1" />
              </span>
              <div>
                <strong>{order.restaurantName}</strong>
                {restaurant && (
                  <div className="order-details__restaurant-meta">
                    <span>{restaurant.category}</span>
                    <span><Star size={13} fill="currentColor" strokeWidth={0} /> {restaurant.rating}</span>
                  </div>
                )}
              </div>
            </div>
            {restaurant && (
              <Button as={Link} to={`/customer/restaurant/${restaurant.id}`} variant="ghost" size="sm" style={{ marginTop: "var(--space-4)" }}>
                View Restaurant
              </Button>
            )}
          </div>

          <div className="order-details__section">
            <h3 className="order-details__section-title">Ordered items</h3>
            <OrderItems items={order.items} />
          </div>

          {showRider && (
            <div className="order-details__section">
              <RiderInfo />
            </div>
          )}

          {canRate && (
            <div className="order-details__section">
              <h3 className="order-details__section-title">Rate Your Order</h3>
              <RatingReview order={order} />
            </div>
          )}
        </div>

        <div>
          <div className="order-details__section">
            <h3 className="order-details__section-title">Delivery &amp; payment</h3>
            <DeliveryInfo
              address={order.deliveryAddress}
              instructions={order.deliveryInstructions}
              paymentMethod={order.paymentMethod}
              paymentStatus={order.paymentStatus}
            />
          </div>

          <div className="order-details__section">
            <h3 className="order-details__section-title">Price details</h3>
            <OrderSummary
              subtotal={order.subtotal}
              deliveryFee={order.deliveryFee}
              discount={order.discount}
              total={order.total}
            />
          </div>

          <div className="order-details__actions">
            {canTrack && (
              <Button as={Link} to={`/customer/orders/${order.id}/track`} icon={RouteIcon} fullWidth>
                Track Order
              </Button>
            )}
            {canReorder && <ReorderButton orderId={order.id} restaurantId={order.restaurantId} fullWidth />}
            {canCancel && (
              <Button variant="danger" fullWidth onClick={() => setCancelOpen(true)}>
                Cancel Order
              </Button>
            )}
          </div>
        </div>
      </div>

      <CancelOrderDialog open={cancelOpen} onClose={() => setCancelOpen(false)} onConfirm={handleConfirmCancel} />
    </div>
  );
}
