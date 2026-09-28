import { Clock, Truck, Wallet, AlarmClock, AlertTriangle } from "lucide-react";
import "./RestaurantInfo.css";

export default function RestaurantInfo({ restaurant }) {
  return (
    <>
      {!restaurant.isOpen && (
        <div className="restaurant-info__closed-banner">
          <AlertTriangle size={20} strokeWidth={2} />
          <div>
            <strong>Closed</strong>
            Ordering is currently unavailable. You can still browse the full menu below.
          </div>
        </div>
      )}

      <div className="restaurant-info">
        <div className="restaurant-info__item">
          <span className="restaurant-info__icon">
            <Clock size={18} strokeWidth={2} />
          </span>
          <div>
            <strong>{restaurant.deliveryTime}</strong>
            <span>Delivery time</span>
          </div>
        </div>
        <div className="restaurant-info__item">
          <span className="restaurant-info__icon">
            <Truck size={18} strokeWidth={2} />
          </span>
          <div>
            <strong>৳{restaurant.deliveryFee}</strong>
            <span>Delivery fee</span>
          </div>
        </div>
        <div className="restaurant-info__item">
          <span className="restaurant-info__icon">
            <Wallet size={18} strokeWidth={2} />
          </span>
          <div>
            <strong>৳{restaurant.minimumOrder}</strong>
            <span>Minimum order</span>
          </div>
        </div>
        <div className="restaurant-info__item">
          <span className="restaurant-info__icon">
            <AlarmClock size={18} strokeWidth={2} />
          </span>
          <div>
            <strong>{restaurant.openingTime} - {restaurant.closingTime}</strong>
            <span>{restaurant.isOpen ? "Open now" : "Opens tomorrow"}</span>
          </div>
        </div>
      </div>
    </>
  );
}
