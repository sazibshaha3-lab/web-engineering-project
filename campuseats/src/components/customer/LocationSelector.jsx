import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import LocationModal from "./LocationModal";
import { useToast } from "../feedback/ToastContext";
import { useDeliveryLocation } from "../../context/LocationContext";
import "./LocationSelector.css";

export default function LocationSelector({ compact = false }) {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const { locations, selected, setSelected, addLocation } = useDeliveryLocation();

  function handleSelect(loc) {
    setSelected(loc);
    setOpen(false);
  }

  function handleAdd(label, autoSelect = false) {
    const loc = addLocation(label);
    if (autoSelect && loc) {
      setSelected(loc);
      setOpen(false);
    }
    toast?.showToast(`${label} added to your locations`, "success");
  }

  return (
    <>
      <button className={`location-selector ${compact ? "location-selector--compact" : ""}`} onClick={() => setOpen(true)}>
        <MapPin size={16} strokeWidth={2} />
        <span className="location-selector__text">
          <span className="location-selector__label">Deliver to</span>
          <span className="location-selector__value">{selected?.label || "Select a location"}</span>
        </span>
        <ChevronDown size={14} strokeWidth={2} />
      </button>

      <LocationModal
        open={open}
        onClose={() => setOpen(false)}
        locations={locations}
        selectedId={selected?.id}
        onSelect={handleSelect}
        onAddLocation={handleAdd}
      />
    </>
  );
}
