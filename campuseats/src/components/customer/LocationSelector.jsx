import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import LocationModal from "./LocationModal";
import { useDeliveryLocation } from "../../context/LocationContext";
import { useAuth } from "../../context/AuthContext";
import "./LocationSelector.css";

export default function LocationSelector({ compact = false }) {
  const [open, setOpen] = useState(false);
  const { locations, selected, setSelected, isLoading, loadError } = useDeliveryLocation();
  const { user } = useAuth();

  function handleSelect(loc) {
    setSelected(loc);
    setOpen(false);
  }

  return (
    <>
      <button className={`location-selector ${compact ? "location-selector--compact" : ""}`} onClick={() => setOpen(true)}>
        <MapPin size={16} strokeWidth={2} />
        <span className="location-selector__text">
          <span className="location-selector__label">Deliver to</span>
          <span className="location-selector__value">
            {user ? (selected ? `${selected.label} · ${selected.line}` : "Add a delivery address") : "Log in to save delivery addresses"}
          </span>
        </span>
        <ChevronDown size={14} strokeWidth={2} />
      </button>

      <LocationModal
        open={open}
        onClose={() => setOpen(false)}
        locations={locations}
        selectedId={selected?.id}
        user={user}
        isLoading={isLoading}
        loadError={loadError}
        onSelect={handleSelect}
      />
    </>
  );
}
