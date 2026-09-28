import { Star, Bike } from "lucide-react";
import "./RiderInfo.css";

const MOCK_RIDER = { name: "Rahim Ahmed", rating: 4.9, vehicle: "Bicycle" };

export default function RiderInfo() {
  return (
    <div className="rider-info">
      <span className="rider-info__avatar">
        {MOCK_RIDER.name.split(" ").map((w) => w[0]).join("")}
      </span>
      <div>
        <p className="rider-info__label">Your delivery rider</p>
        <p className="rider-info__name">{MOCK_RIDER.name}</p>
        <div className="rider-info__meta">
          <span><Star size={13} fill="currentColor" strokeWidth={0} /> {MOCK_RIDER.rating}</span>
          <span><Bike size={13} strokeWidth={2} /> {MOCK_RIDER.vehicle}</span>
        </div>
      </div>
    </div>
  );
}
