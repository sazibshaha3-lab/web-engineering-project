import { MapPin, MessageSquare, Wallet2 } from "lucide-react";
import "./DeliveryInfo.css";

export default function DeliveryInfo({ address, instructions, paymentStatus }) {

  return (
    <div>
      <div className="delivery-info__row">
        <span className="delivery-info__icon">
          <MapPin size={16} strokeWidth={2} />
        </span>
        <div>
          <p className="delivery-info__label">Delivery to</p>
          <p className="delivery-info__value">{address?.label}</p>
          <p className="delivery-info__sub">
            {address?.line}
            {address?.area ? `, ${address.area}` : ""}
            {address?.city ? `, ${address.city}` : ""}
          </p>
        </div>
      </div>

      {instructions && (
        <div className="delivery-info__row">
          <span className="delivery-info__icon">
            <MessageSquare size={16} strokeWidth={2} />
          </span>
          <div>
            <p className="delivery-info__label">Delivery instructions</p>
            <p className="delivery-info__sub">"{instructions}"</p>
          </div>
        </div>
      )}

      <div className="delivery-info__row">
        <span className="delivery-info__icon">
          <Wallet2 size={16} strokeWidth={2} />
        </span>
        <div>
          <p className="delivery-info__label">Payment</p>
          <p className="delivery-info__value">Cash on Delivery</p>
          <p className="delivery-info__sub">{paymentStatus}</p>
        </div>
      </div>
    </div>
  );
}
