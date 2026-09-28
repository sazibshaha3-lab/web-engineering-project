import { useState } from "react";
import { Store, MapPin, Navigation, Clock } from "lucide-react";
import Button from "../common/Button";
import { estimateDistanceKm } from "../../utils/riderMock";
import { currentCustomer } from "../../data/users";

export default function DeliveryRequestCard({ order, restaurant, onAccept, onDecline }) {
  const [accepting, setAccepting] = useState(false);
  const distance = estimateDistanceKm(order.id);

  function handleAccept() {
    if (accepting) return;
    setAccepting(true);
    const success = onAccept(order.id);
    if (success === false) setAccepting(false);
  }
  const requestTime = new Date(order.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  return (
    <div className="delivery-request-card">
      <div className="delivery-request-card__top">
        <div>
          <p className="delivery-request-card__id">{order.id}</p>
          <p className="delivery-request-card__time">Requested at {requestTime}</p>
        </div>
        <span className="delivery-request-card__total">৳{order.total}</span>
      </div>

      <div className="delivery-request-card__route">
        <div className="delivery-request-card__stop">
          <span className="delivery-request-card__stop-icon delivery-request-card__stop-icon--pickup">
            <Store size={14} strokeWidth={2} />
          </span>
          <div>
            <span>Pickup</span>
            <strong>{restaurant?.name}</strong>
          </div>
        </div>
        <div className="delivery-request-card__stop">
          <span className="delivery-request-card__stop-icon delivery-request-card__stop-icon--dropoff">
            <MapPin size={14} strokeWidth={2} />
          </span>
          <div>
            <span>Deliver to</span>
            <strong>{order.deliveryAddress?.label} · {currentCustomer.name}</strong>
          </div>
        </div>
      </div>

      <div className="delivery-request-card__meta">
        <span><Navigation size={13} strokeWidth={2} /> {distance} km</span>
        <span><Clock size={13} strokeWidth={2} /> {order.estimatedDeliveryTime}</span>
      </div>

      <div className="delivery-request-card__actions">
        <Button loading={accepting} disabled={accepting} onClick={handleAccept}>
          Accept Delivery
        </Button>
        <Button variant="ghost" disabled={accepting} onClick={() => onDecline(order.id)}>
          Decline
        </Button>
      </div>
    </div>
  );
}
