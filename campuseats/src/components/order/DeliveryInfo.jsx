import { MapPin, MessageSquare, Wallet2, CreditCard } from "lucide-react";
import "./DeliveryInfo.css";

const paymentLabels = { cod: "Cash on Delivery", online: "Online Payment" };
const paymentIcons = { cod: Wallet2, online: CreditCard };

export default function DeliveryInfo({ address, instructions, paymentMethod, paymentStatus }) {
  const PaymentIcon = paymentIcons[paymentMethod] || Wallet2;

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
          <PaymentIcon size={16} strokeWidth={2} />
        </span>
        <div>
          <p className="delivery-info__label">Payment</p>
          <p className="delivery-info__value">{paymentLabels[paymentMethod] || paymentMethod}</p>
          <p className="delivery-info__sub">{paymentStatus}</p>
        </div>
      </div>
    </div>
  );
}
