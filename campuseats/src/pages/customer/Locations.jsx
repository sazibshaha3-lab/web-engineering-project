import { MapPin, Plus } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { Badge } from "../../components/common/Badge";
import Button from "../../components/common/Button";
import IconButton from "../../components/common/IconButton";
import { Pencil, Trash2 } from "lucide-react";
import { currentCustomer } from "../../data/users";
import "./Locations.css";

export default function Locations() {
  return (
    <div className="fade-in">
      <PageHeader
        icon={MapPin}
        title="Saved locations"
        description="Manage the addresses you deliver to most often."
        actions={
          <Button icon={Plus} size="sm">
            Add location
          </Button>
        }
      />

      {currentCustomer.savedLocations.map((loc) => (
        <div className="location-card" key={loc.id}>
          <span className="location-card__icon">
            <MapPin size={20} strokeWidth={2} />
          </span>
          <div className="location-card__info">
            <p style={{ fontWeight: 600, marginBottom: 4 }}>{loc.label}</p>
            {loc.isDefault && <Badge tone="success">Default</Badge>}
          </div>
          <IconButton icon={Pencil} label="Edit location" />
          <IconButton icon={Trash2} label="Remove location" />
        </div>
      ))}
    </div>
  );
}
