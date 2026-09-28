import { MapPin, Hash } from "lucide-react";
import ImageWithFallback from "../common/ImageWithFallback";
import "./PickupInfo.css";

export default function PickupInfo({ restaurant, orderId }) {
  return (
    <div className="pickup-info">
      <span className="pickup-info__logo">
        <ImageWithFallback src={restaurant?.logo} alt={restaurant?.name} ratio="1 / 1" />
      </span>
      <div>
        <p className="pickup-info__name">{restaurant?.name}</p>
        <p className="pickup-info__row">
          <MapPin size={13} strokeWidth={2} /> {restaurant?.address}
        </p>
        <p className="pickup-info__row">
          <Hash size={13} strokeWidth={2} /> {orderId}
        </p>
      </div>
    </div>
  );
}
