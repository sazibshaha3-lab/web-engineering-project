import { useParams, Link } from "react-router-dom";
import { PackageSearch, User } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import OrderStatusBadge from "../../components/order/OrderStatusBadge";
import OrderStatusTimeline from "../../components/order/OrderStatusTimeline";
import OrderItems from "../../components/order/OrderItems";
import DeliveryInfo from "../../components/order/DeliveryInfo";
import OrderSummary from "../../components/order/OrderSummary";
import OrderActionButtons from "../../components/restaurant/OrderActionButtons";
import useOrderRecord from "../../hooks/useOrderRecord";
import OrderLookupState from "../../components/order/OrderLookupState";
import { useRestaurantData } from "../../context/RestaurantContext";
import { liveOrderStatusMap } from "../../utils/statusMaps";
import "./RestaurantOrderDetails.css";

export default function RestaurantOrderDetails() {
  const { orderId } = useParams();
  const { restaurant } = useRestaurantData();
  const { order, loading, error, retry } = useOrderRecord(orderId);

  if (!order || order.restaurantId !== restaurant?.id) {
    if (!order) {
      return <OrderLookupState loading={loading} error={error} onRetry={retry} backTo="/restaurant/orders" backLabel="Back to Orders" />;
    }
    return (
      <OrderLookupState loading={false} error="This order is not available to this restaurant." backTo="/restaurant/orders" backLabel="Back to Orders" />
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        icon={PackageSearch}
        title={order.id}
        description={new Date(order.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
        actions={<OrderStatusBadge status={order.status} />}
      />

      <div className={`rorder-details__banner rorder-details__banner--${liveOrderStatusMap[order.status]?.tone || "neutral"}`}>
        {liveOrderStatusMap[order.status]?.banner}
      </div>

      <div className="rorder-details__actions">
        <OrderActionButtons order={order} />
      </div>

      <div className="rorder-details__grid">
        <div>
          <div className="rorder-details__panel">
            <h3>Customer</h3>
            <p className="rorder-details__customer">
              <User size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
              <strong>{order.customer?.name || "Customer"}</strong>
            </p>
            {order.customer?.phone && (
              <a className="rorder-details__customer-phone" href={`tel:${order.customer.phone}`}>
                Call customer · {order.customer.phone}
              </a>
            )}
            <DeliveryInfo
              address={order.deliveryAddress}
              instructions={order.deliveryInstructions}
              paymentStatus={order.paymentStatus}
            />
          </div>

          <div className="rorder-details__panel">
            <h3>Items</h3>
            <OrderItems items={order.items} />
          </div>

          <div className="rorder-details__panel">
            <h3>Status timeline</h3>
            <OrderStatusTimeline status={order.status} />
          </div>
        </div>

        <div className="rorder-details__panel" style={{ position: "sticky", top: 90 }}>
          <h3>Order total</h3>
          <OrderSummary
            subtotal={order.subtotal}
            deliveryFee={order.deliveryFee}
            discount={order.discount}
            total={order.total}
          />
        </div>
      </div>

      <Link to="/restaurant/orders" style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: "0.9rem" }}>
        ← Back to orders
      </Link>
    </div>
  );
}
