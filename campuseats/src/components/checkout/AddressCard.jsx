import { Home, Building2, School, UtensilsCrossed, MapPin, Pencil, Trash2 } from "lucide-react";
import { Badge } from "../common/Badge";
import IconButton from "../common/IconButton";
import "./AddressCard.css";

const labelIcons = {
  Home,
  Hostel: Building2,
  University: School,
  Mess: UtensilsCrossed,
  Other: MapPin,
};

export default function AddressCard({ address, selected, onSelect, onEdit, onDelete }) {
  const Icon = labelIcons[address.label] || MapPin;

  return (
    <div
      className={`address-card ${selected ? "is-selected" : ""}`}
      onClick={() => onSelect(address.id)}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(address.id)}
    >
      <span className="address-card__radio">
        <span className="address-card__radio-dot" />
      </span>
      <div className="address-card__body">
        <div className="address-card__top">
          <Icon size={15} strokeWidth={2} color="var(--color-primary)" />
          <span className="address-card__label">{address.label}</span>
          {address.isDefault && <Badge tone="success">Default</Badge>}
        </div>
        <p className="address-card__line">{address.line}</p>
        <p className="address-card__meta">
          {address.area}{address.area && address.city ? ", " : ""}{address.city}
          {address.details ? ` · ${address.details}` : ""}
        </p>
      </div>
      <div className="address-card__actions" onClick={(e) => e.stopPropagation()}>
        <IconButton icon={Pencil} label="Edit address" size="sm" onClick={() => onEdit(address)} />
        <IconButton icon={Trash2} label="Delete address" size="sm" onClick={() => onDelete(address)} />
      </div>
    </div>
  );
}
