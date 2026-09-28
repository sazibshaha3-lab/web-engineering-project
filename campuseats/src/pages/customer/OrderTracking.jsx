import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import ErrorState from "../../components/common/ErrorState";
import Button from "../../components/common/Button";
import { SkeletonBlock } from "../../components/common/SkeletonLoader";
import OrderStatusBadge from "../../components/order/OrderStatusBadge";
import OrderStatusTimeline from "../../components/order/OrderStatusTimeline";
import RiderInfo from "../../components/order/RiderInfo";
import { useOrders } from "../../context/OrderContext";
import "./OrderTracking.css";

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrderById } = useOrders();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

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

  const isTerminal = order.status === "REJECTED" || order.status === "CANCELLED";
  const showRider = order.status === "PICKED_UP" || order.status === "OUT_FOR_DELIVERY";

  return (
    <div className="fade-in">
      <div className="order-tracking__header">
        <Link to={`/customer/orders/${order.id}`} className="order-tracking__back">
          <ArrowLeft size={16} strokeWidth={2} /> Back to Order Details
        </Link>
        <OrderStatusBadge status={order.status} />
      </div>
      <h1 className="order-tracking__title">{order.id}</h1>

      {loading ? (
        <div className="order-tracking__grid">
          <SkeletonBlock height="360px" radius="var(--radius-lg)" style={{ display: "block" }} />
          <SkeletonBlock height="220px" radius="var(--radius-lg)" style={{ display: "block" }} />
        </div>
      ) : (
        <div className="order-tracking__grid">
          <div>
            <div className="order-tracking__panel">
              <h3 className="order-tracking__panel-title">
                {isTerminal ? "Order status" : "Order status timeline"}
              </h3>
              <OrderStatusTimeline status={order.status} />

              {isTerminal && (
                <div className="order-tracking__terminal-actions">
                  <Button as={Link} to="/customer/restaurants" variant="secondary">
                    Back to Restaurants
                  </Button>
                  <Button as={Link} to={`/customer/orders/${order.id}`} variant="ghost">
                    View Order Details
                  </Button>
                </div>
              )}
            </div>

            {showRider && (
              <div className="order-tracking__panel">
                <RiderInfo />
              </div>
            )}
          </div>

          <div>
            <div className="order-tracking__panel order-tracking__panel--sticky">
              <h3 className="order-tracking__panel-title">Delivery information</h3>

              {!isTerminal && (
                <div className="order-tracking__eta">
                  <Clock size={20} strokeWidth={2} />
                  <div>
                    <span>Estimated delivery</span>
                    {order.estimatedDeliveryTime}
                  </div>
                </div>
              )}

              <div className="order-tracking__info-row">
                <span>Restaurant</span>
                <strong>{order.restaurantName}</strong>
              </div>
              <div className="order-tracking__info-row">
                <span>Deliver to</span>
                <strong>{order.deliveryAddress?.label}</strong>
              </div>
              <div className="order-tracking__info-row">
                <span>Address</span>
                <strong>{order.deliveryAddress?.line}</strong>
              </div>
              <div className="order-tracking__info-row">
                <span>Order total</span>
                <strong>৳{order.total}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
