import { Link } from "react-router-dom";
import { Store, MapPin, Clock } from "lucide-react";
import DeliveryActionButtons from "./DeliveryActionButtons";
import { currentCustomer } from "../../data/users";
import "./ActiveDeliveryCard.css";

export default function ActiveDeliveryCard({ order, restaurant }) {
  return (
    <div className="active-delivery-card">
      <div className="active-delivery-card__top">
        <div>
          <p className="active-delivery-card__id">{order.id}</p>
          <p className="active-delivery-card__restaurant">{restaurant?.name}</p>
        </div>
        <Link to={`/rider/deliveries/${order.id}`} style={{ color: "var(--color-accent)", fontSize: "0.85rem", fontWeight: 700 }}>
          View details
        </Link>
      </div>

      <div className="active-delivery-card__route">
        <div className="active-delivery-card__stop">
          <Store size={16} strokeWidth={2} />
          <div>
            <span>Pickup</span>
            {restaurant?.address}
          </div>
        </div>
        <div className="active-delivery-card__stop">
          <MapPin size={16} strokeWidth={2} />
          <div>
            <span>Deliver to</span>
            {order.deliveryAddress?.label} · {currentCustomer.name}
          </div>
        </div>
      </div>

      <div className="active-delivery-card__footer">
        <span className="active-delivery-card__eta">
          <Clock size={13} strokeWidth={2} style={{ verticalAlign: "-2px", marginRight: 4 }} />
          Estimated {order.estimatedDeliveryTime}
        </span>
        <span className="active-delivery-card__total">৳{order.total}</span>
      </div>

      <DeliveryActionButtons order={order} />
    </div>
  );
}
