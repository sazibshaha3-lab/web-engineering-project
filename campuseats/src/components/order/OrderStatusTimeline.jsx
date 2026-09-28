import {
  ClipboardCheck,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  Bike,
  Truck,
  PartyPopper,
  XCircle,
  Ban,
} from "lucide-react";
import { liveOrderStatusFlow } from "../../utils/statusMaps";
import "./OrderStatusTimeline.css";

const stepMeta = {
  PLACED: { icon: ClipboardCheck, title: "Order placed", desc: "We've received your order." },
  ACCEPTED: { icon: CheckCircle2, title: "Restaurant accepted", desc: "The restaurant confirmed your order." },
  PREPARING: { icon: ChefHat, title: "Preparing your food", desc: "Your food is being cooked fresh." },
  READY_FOR_PICKUP: { icon: PackageCheck, title: "Ready for pickup", desc: "Waiting for a rider to collect it." },
  PICKED_UP: { icon: Bike, title: "Picked up", desc: "Your rider has picked up the order." },
  OUT_FOR_DELIVERY: { icon: Truck, title: "Out for delivery", desc: "Your order is on its way to you." },
  DELIVERED: { icon: PartyPopper, title: "Delivered", desc: "Enjoy your meal!" },
};

export default function OrderStatusTimeline({ status }) {
  if (status === "REJECTED" || status === "CANCELLED") {
    const Icon = status === "REJECTED" ? XCircle : Ban;
    return (
      <div className="order-timeline__terminal order-timeline__terminal--error">
        <span className="order-timeline__terminal-icon">
          <Icon size={20} strokeWidth={2} />
        </span>
        <div>
          <h4>{status === "REJECTED" ? "Order rejected" : "Order cancelled"}</h4>
          <p>
            {status === "REJECTED"
              ? "The restaurant was unable to accept this order."
              : "This order was cancelled and will not be delivered."}
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = liveOrderStatusFlow.indexOf(status);

  return (
    <div className="order-timeline">
      {liveOrderStatusFlow.map((step, i) => {
        const meta = stepMeta[step];
        const isCompleted = i < currentIndex || (i === currentIndex && status === "DELIVERED");
        const isCurrent = i === currentIndex && status !== "DELIVERED";
        return (
          <div
            key={step}
            className={`order-timeline__step ${isCompleted ? "is-completed" : ""} ${isCurrent ? "is-current" : ""}`}
          >
            <span className="order-timeline__icon">
              <meta.icon size={16} strokeWidth={2} />
            </span>
            <div className="order-timeline__body">
              <p className="order-timeline__title">{meta.title}</p>
              <p className="order-timeline__desc">{meta.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
