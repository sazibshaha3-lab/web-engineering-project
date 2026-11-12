import { useParams, Link } from "react-router-dom";
import { PackageSearch, User, Store, Bike } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import OrderStatusBadge from "../../components/order/OrderStatusBadge";
import OrderStatusTimeline from "../../components/order/OrderStatusTimeline";
import OrderItems from "../../components/order/OrderItems";
import DeliveryInfo from "../../components/order/DeliveryInfo";
import OrderSummary from "../../components/order/OrderSummary";
import AdminOrderStatusControl from "../../components/admin/AdminOrderStatusControl";
import useOrderRecord from "../../hooks/useOrderRecord";
import OrderLookupState from "../../components/order/OrderLookupState";
import { useAdmin } from "../../context/AdminContext";
import { liveOrderStatusMap } from "../../utils/statusMaps";
import "./admin-shared.css";

export default function AdminOrderDetails() {
  const { orderId } = useParams();
  const { allRestaurants, riders } = useAdmin();
  const { order, loading, error, retry } = useOrderRecord(orderId);

  if (!order) {
    return (
      <OrderLookupState loading={loading} error={error} onRetry={retry} backTo="/admin/orders" />
    );
  }

  const restaurant = allRestaurants.find((r) => r.id === order.restaurantId);
  const rider = riders.find((r) => r.id === order.riderId);

  return (
    <div className="fade-in">
      <PageHeader
        icon={PackageSearch}
        title={order.id}
        description={new Date(order.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
        actions={<OrderStatusBadge status={order.status} />}
      />

      <div className={`admin-detail__banner admin-detail__banner--${liveOrderStatusMap[order.status]?.tone || "info"}`}>
        {liveOrderStatusMap[order.status]?.banner}
      </div>

      <div style={{ marginBottom: "var(--space-6)" }}>
        <AdminOrderStatusControl order={order} />
      </div>

      <div className="admin-detail__grid">
        <div>
          <div className="dashboard-panel admin-detail__panel">
            <h3>
              <User size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />
              Customer
            </h3>
            <div className="admin-detail__field">
              <span>Name</span>
              <span>{order.customer?.name || "Customer"}</span>
            </div>
            <div className="admin-detail__field">
              <span>Phone</span>
              <span>{order.customer?.phone || "—"}</span>
            </div>
            <DeliveryInfo
              address={order.deliveryAddress}
              instructions={order.deliveryInstructions}
              paymentStatus={order.paymentStatus}
            />
          </div>

          <div className="dashboard-panel admin-detail__panel">
            <h3>
              <Store size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />
              Restaurant
            </h3>
            {restaurant ? (
              <>
                <div className="admin-detail__field">
                  <span>Name</span>
                  <span>
                    <Link to={`/admin/restaurants/${restaurant.id}`}>{restaurant.name}</Link>
                  </span>
                </div>
                <div className="admin-detail__field">
                  <span>Address</span>
                  <span>{restaurant.address}</span>
                </div>
              </>
            ) : (
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem" }}>Restaurant details unavailable.</p>
            )}
          </div>

          <div className="dashboard-panel admin-detail__panel">
            <h3>
              <Bike size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />
              Rider
            </h3>
            {rider ? (
              <>
                <div className="admin-detail__field">
                  <span>Name</span>
                  <span>
                    <Link to={`/admin/riders/${rider.id}`}>{rider.name}</Link>
                  </span>
                </div>
                <div className="admin-detail__field">
                  <span>Vehicle</span>
                  <span>{rider.vehicleType}</span>
                </div>
                <div className="admin-detail__field">
                  <span>Contact</span>
                  <span>{rider.phone}</span>
                </div>
              </>
            ) : (
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem" }}>Not yet assigned to a rider.</p>
            )}
          </div>

          <div className="dashboard-panel admin-detail__panel">
            <h3>Items</h3>
            <OrderItems items={order.items} />
          </div>

          <div className="dashboard-panel admin-detail__panel">
            <h3>Order timeline</h3>
            <OrderStatusTimeline status={order.status} />
          </div>
        </div>

        <div className="dashboard-panel admin-detail__panel" style={{ position: "sticky", top: 90 }}>
          <h3>Order total</h3>
          <OrderSummary subtotal={order.subtotal} deliveryFee={order.deliveryFee} discount={order.discount} total={order.total} />
        </div>
      </div>

      <Link to="/admin/orders" className="admin-back-link">
        ← Back to orders
      </Link>
    </div>
  );
}
