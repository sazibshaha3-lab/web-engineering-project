import { User, MapPin, MessageSquare } from "lucide-react";
import "./CustomerDeliveryInfo.css";

export default function CustomerDeliveryInfo({ address, instructions, customer }) {
  return (
    <div>
      <div className="customer-delivery-info__row">
        <User size={16} strokeWidth={2} />
        <div>
          <span>Customer</span>
          <strong>{customer?.name || "Customer"}</strong>
        </div>
      </div>
      <div className="customer-delivery-info__row">
        <MapPin size={16} strokeWidth={2} />
        <div>
          <span>Delivery address</span>
          <strong>{address?.label} — {address?.line}</strong>
          {address?.latitude != null && address?.longitude != null && (
            <a
              className="customer-delivery-info__map-link"
              href={`https://www.google.com/maps/search/?api=1&query=${address.latitude},${address.longitude}`}
              target="_blank"
              rel="noreferrer"
            >
              Open delivery pin in Maps
            </a>
          )}
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
