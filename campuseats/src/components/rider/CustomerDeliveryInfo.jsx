import { User, MapPin, MessageSquare } from "lucide-react";
import { currentCustomer } from "../../data/users";
import "./CustomerDeliveryInfo.css";

export default function CustomerDeliveryInfo({ address, instructions }) {
  return (
    <div>
      <div className="customer-delivery-info__row">
        <User size={16} strokeWidth={2} />
        <div>
          <span>Customer</span>
          <strong>{currentCustomer.name}</strong>
        </div>
      </div>
      <div className="customer-delivery-info__row">
        <MapPin size={16} strokeWidth={2} />
        <div>
          <span>Delivery address</span>
          <strong>{address?.label} — {address?.line}</strong>
        </div>
      </div>
      {instructions && (
        <div className="customer-delivery-info__row">
          <MessageSquare size={16} strokeWidth={2} />
          <div>
            <span>Delivery instructions</span>
            <strong>"{instructions}"</strong>
          </div>
        </div>
      )}
    </div>
  );
}
