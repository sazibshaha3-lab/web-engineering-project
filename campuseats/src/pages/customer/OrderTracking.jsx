import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  ClipboardCheck,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  Bike,
  Truck,
  PartyPopper,
  XCircle,
  Ban,
  ExternalLink,
} from "lucide-react";
import ErrorState from "../../components/common/ErrorState";
import Button from "../../components/common/Button";
import { SkeletonBlock } from "../../components/common/SkeletonLoader";
import OrderStatusBadge from "../../components/order/OrderStatusBadge";
import OrderItems from "../../components/order/OrderItems";
import OrderSummary from "../../components/order/OrderSummary";
import { useOrders } from "../../context/OrderContext";
import { liveOrderStatusFlow, liveOrderStatusMap } from "../../utils/statusMaps";
import "./OrderTracking.css";

// Step metadata — icons and labels for the progress tracker
const STEP_META = {
  PLACED:            { icon: ClipboardCheck, label: "Placed",          desc: "Order received" },
  ACCEPTED:          { icon: CheckCircle2,   label: "Accepted",         desc: "Restaurant confirmed" },
  PREPARING:         { icon: ChefHat,        label: "Preparing",        desc: "Being cooked fresh" },
  READY_FOR_PICKUP:  { icon: PackageCheck,   label: "Ready",            desc: "Waiting for rider" },
  PICKED_UP:         { icon: Bike,           label: "Picked up",        desc: "Rider has your order" },
  OUT_FOR_DELIVERY:  { icon: Truck,          label: "On the way",       desc: "Heading to you" },
  DELIVERED:         { icon: PartyPopper,    label: "Delivered",        desc: "Enjoy your meal!" },
};

// ─────────────────────────────────────────────
// Visual Progress Tracker
// ─────────────────────────────────────────────
function ProgressTracker({ status }) {
  const currentIndex = liveOrderStatusFlow.indexOf(status);

  return (
    <ol className="ot-tracker" aria-label="Order progress">
      {liveOrderStatusFlow.map((step, i) => {
        const meta = STEP_META[step];
        const isCompleted = i < currentIndex || status === "DELIVERED";
        const isCurrent   = i === currentIndex && status !== "DELIVERED";
        const Icon = meta.icon;
        const isMoving = step === "OUT_FOR_DELIVERY" && isCurrent;

        return (
          <li
            key={step}
            className={
              "ot-tracker__step" +
              (isCompleted ? " is-completed" : "") +
              (isCurrent   ? " is-current"   : "")
            }
            aria-current={isCurrent ? "step" : undefined}
          >
            {/* Connector line rendered before step (skipped for first) */}
            {i > 0 && (
              <span
                className={"ot-tracker__line" + (isCompleted ? " is-filled" : "")}
                aria-hidden="true"
              />
            )}

            {/* Icon bubble */}
            <span className="ot-tracker__bubble" aria-hidden="true">
              <span className={isMoving ? "ot-tracker__moving-icon" : undefined}>
                <Icon size={16} strokeWidth={2} />
              </span>
            </span>

            {/* Label */}
            <span className="ot-tracker__label">
              <span className="ot-tracker__label-title">{meta.label}</span>
              <span className="ot-tracker__label-desc">{meta.desc}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// ─────────────────────────────────────────────
// Terminal status box (rejected / cancelled)
// ─────────────────────────────────────────────
function TerminalBox({ status }) {
  const isRejected = status === "REJECTED";
  const Icon = isRejected ? XCircle : Ban;
  return (
    <div className="ot-terminal rise-in" role="alert">
      <span className="ot-terminal__icon-wrap" aria-hidden="true">
        <Icon size={22} strokeWidth={2} />
      </span>
      <div>
        <p className="ot-terminal__heading">
          {isRejected ? "Order rejected" : "Order cancelled"}
        </p>
        <p className="ot-terminal__body">
          {isRejected
            ? "The restaurant was unable to accept this order. No payment was charged."
            : "This order was cancelled and will not be delivered. Any charge will be refunded."}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Rider card  (only rendered when rider exists)
// ─────────────────────────────────────────────
function RiderCard({ rider }) {
  const initials = rider.name
    ? rider.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="ot-rider rise-in">
      <span className="ot-rider__avatar" aria-hidden="true">
        {initials}
      </span>
      <div className="ot-rider__info">
        <p className="ot-rider__label">Your delivery rider</p>
        <p className="ot-rider__name">{rider.name || "Rider"}</p>
      </div>
      {rider.phone && (
        <a
          href={`tel:${rider.phone}`}
          className="ot-rider__call"
          aria-label={`Call ${rider.name || "rider"}`}
        >
          <Phone size={18} strokeWidth={2} />
        </a>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Delivery info rows
// ─────────────────────────────────────────────
function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="ot-info-row">
      <span className="ot-info-row__label">{label}</span>
      <span className="ot-info-row__value">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
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
  const showRider  = (order.status === "PICKED_UP" || order.status === "OUT_FOR_DELIVERY") && order.rider;
  const statusMeta = liveOrderStatusMap[order.status] || { label: order.status, tone: "neutral", banner: "" };

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <div className="ot-root fade-in">
      {/* ── Top nav row ── */}
      <div className="ot-topnav">
        <Link to="/customer/orders" className="ot-topnav__back">
          <ArrowLeft size={16} strokeWidth={2} />
          All orders
        </Link>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* ── Page heading ── */}
      <header className="ot-heading">
        <h1 className="ot-heading__number">{order.id}</h1>
        <div className="ot-heading__meta">
          {order.restaurantName && (
            <span className="ot-heading__restaurant">{order.restaurantName}</span>
          )}
          {orderDate && (
            <span className="ot-heading__date">
              <Clock size={13} strokeWidth={2} aria-hidden="true" />
              {orderDate}
            </span>
          )}
        </div>
      </header>

      {/* ── ETA chip (non-terminal only) ── */}
      {!isTerminal && order.estimatedDeliveryTime && (
        <div className="ot-eta rise-in" role="status" aria-live="polite">
          <Clock size={18} strokeWidth={2} aria-hidden="true" />
          <div>
            <span className="ot-eta__eyebrow">Estimated delivery</span>
            <strong className="ot-eta__value">{order.estimatedDeliveryTime}</strong>
          </div>
        </div>
      )}

      {/* ── Status banner ── */}
      {statusMeta.banner && (
        <div className={`ot-banner ot-banner--${statusMeta.tone} rise-in`} role="status">
          {statusMeta.banner}
        </div>
      )}

      {loading ? (
        /* ── Skeleton ── */
        <div className="ot-skeleton-grid">
          <SkeletonBlock height="320px" radius="var(--radius-lg)" style={{ display: "block" }} />
          <SkeletonBlock height="200px" radius="var(--radius-lg)" style={{ display: "block" }} />
        </div>
      ) : (
        <div className="ot-grid">

          {/* ── LEFT / TOP column ── */}
          <div className="ot-col-main">

            {/* Progress tracker — hidden for terminal statuses */}
            {!isTerminal && (
              <section className="ot-panel rise-in" aria-label="Order progress">
                <h2 className="ot-panel__title">Order progress</h2>
                <ProgressTracker status={order.status} />
              </section>
            )}

            {/* Terminal error box */}
            {isTerminal && (
              <section className="ot-panel" aria-label="Order status">
                <h2 className="ot-panel__title">Order status</h2>
                <TerminalBox status={order.status} />
                <div className="ot-terminal-actions">
                  <Button as={Link} to="/customer/restaurants" variant="secondary">
                    Browse restaurants
                  </Button>
                  <Button as={Link} to={`/customer/orders/${order.id}`} variant="ghost">
                    View full details
                  </Button>
                </div>
              </section>
            )}

            {/* Rider info (only when rider data exists from API) */}
            {showRider && <RiderCard rider={order.rider} />}

            {/* Items */}
            <section className="ot-panel rise-in" aria-label="Ordered items">
              <h2 className="ot-panel__title">Your items</h2>
              <OrderItems items={order.items} />
            </section>
          </div>

          {/* ── RIGHT / BOTTOM column ── */}
          <div className="ot-col-side">
            <div className="ot-panel ot-panel--sticky rise-in" aria-label="Delivery and payment">
              <h2 className="ot-panel__title">Delivery details</h2>

              {order.deliveryAddress && (
                <div className="ot-address">
                  <MapPin size={16} strokeWidth={2} className="ot-address__icon" aria-hidden="true" />
                  <div>
                    {order.deliveryAddress.label && (
                      <p className="ot-address__label">{order.deliveryAddress.label}</p>
                    )}
                    {order.deliveryAddress.line && (
                      <p className="ot-address__line">{order.deliveryAddress.line}</p>
                    )}
                    {order.deliveryAddress.area && (
                      <p className="ot-address__area">{order.deliveryAddress.area}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="ot-divider" />

              <InfoRow label="Restaurant"    value={order.restaurantName} />
              <InfoRow label="Payment"       value={order.paymentMethod === "cod" ? "Cash on delivery" : "Online"} />
              <InfoRow label="Payment status" value={order.paymentStatus} />

              <div className="ot-divider" />

              <OrderSummary
                subtotal={order.subtotal}
                deliveryFee={order.deliveryFee}
                discount={order.discount}
                total={order.total}
              />

              <div className="ot-side-actions">
                <Button
                  as={Link}
                  to={`/customer/orders/${order.id}`}
                  variant="ghost"
                  icon={ExternalLink}
                  fullWidth
                >
                  Full order details
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
