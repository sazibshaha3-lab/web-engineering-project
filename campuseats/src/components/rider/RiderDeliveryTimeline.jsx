import { Check } from "lucide-react";
import "./RiderDeliveryTimeline.css";

const steps = [
  { key: "READY_FOR_PICKUP", label: "Ready for pickup" },
  { key: "PICKED_UP", label: "Picked up" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

export default function RiderDeliveryTimeline({ status }) {
  const activeIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="rider-timeline">
      {steps.map((step, i) => {
        const done = activeIndex === -1 ? false : i < activeIndex || (i === activeIndex && status === "DELIVERED");
        const isCurrent = i === activeIndex && status !== "DELIVERED";

        return (
          <div key={step.key} className={`rider-timeline__step ${done ? "is-done" : ""} ${isCurrent ? "is-current" : ""}`}>
            <span className="rider-timeline__icon">
              {done ? <Check size={16} strokeWidth={2.5} /> : <span style={{ width: 8, height: 8, borderRadius: "50%", background: "currentColor" }} />}
            </span>
            <div className="rider-timeline__body">
              <p className="rider-timeline__title">{step.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
