import { useState } from "react";
import { LocateFixed, MapPin, Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import Modal from "../feedback/Modal";
import BottomSheet from "../common/BottomSheet";
import IconButton from "../common/IconButton";
import Button from "../common/Button";
import Input from "../forms/Input";
import ErrorState from "../common/ErrorState";
import useMediaQuery from "../../hooks/useMediaQuery";
import { popularAreas } from "../../data/locations";
import "./LocationModal.css";

export default function LocationModal({ open, onClose, locations, selectedId, onSelect, onAddLocation }) {
  const isMobile = useMediaQuery("(max-width: 719px)");
  const [locating, setLocating] = useState(false);
  const [locateFailed, setLocateFailed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  function handleUseCurrentLocation() {
    setLocating(true);
    setLocateFailed(false);
    setTimeout(() => {
      setLocating(false);
      setLocateFailed(true);
    }, 1100);
  }

  function handleAddSubmit(e) {
    e.preventDefault();
    if (!newLabel.trim()) return;
    onAddLocation?.(newLabel.trim());
    setNewLabel("");
    setAdding(false);
  }

  const body = (
    <>
      {locateFailed ? (
        <div style={{ marginBottom: "var(--space-5)" }}>
          <ErrorState
            title="We couldn't determine your location"
            description="CampusEats doesn't use real GPS in this preview. Pick a saved location or area instead."
            onRetry={handleUseCurrentLocation}
          />
          <button
            className="location-modal__manual-link"
            onClick={() => setLocateFailed(false)}
          >
            Select manually from the list below
          </button>
        </div>
      ) : (
        <button className="location-modal__current" onClick={handleUseCurrentLocation} disabled={locating}>
          <LocateFixed size={18} strokeWidth={2} />
          {locating ? "Finding your location..." : "Use current location"}
        </button>
      )}

      <p className="location-modal__section-title">Popular areas</p>
      <div className="location-modal__areas">
        {popularAreas.map((area) => (
          <button
            key={area.id}
            className="location-modal__area-chip"
            onClick={() => {
              onAddLocation?.(area.label, true);
            }}
          >
            {area.label}
          </button>
        ))}
      </div>

      <p className="location-modal__section-title">Saved locations</p>
      {locations.map((loc) => (
        <div
          key={loc.id}
          className={`location-modal__row ${loc.id === selectedId ? "is-selected" : ""}`}
          onClick={() => onSelect(loc)}
        >
          <span className="location-modal__row-icon">
            <MapPin size={16} strokeWidth={2} />
          </span>
          <span className="location-modal__row-text">
            <strong>{loc.label}</strong>
            {loc.isDefault && <span>Default location</span>}
          </span>
          <span className="location-modal__row-actions" onClick={(e) => e.stopPropagation()}>
            <IconButton icon={Pencil} label="Edit location" size="sm" />
            <IconButton icon={Trash2} label="Remove location" size="sm" />
          </span>
          <ChevronRight size={16} color="var(--color-text-muted)" />
        </div>
      ))}

      {adding ? (
        <form className="location-modal__add-form" onSubmit={handleAddSubmit}>
          <Input
            placeholder="e.g. Boys' Hall, Room 12"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            autoFocus
          />
          <Button type="submit" size="md">Save</Button>
        </form>
      ) : (
        <Button variant="ghost" icon={Plus} onClick={() => setAdding(true)} style={{ marginTop: "var(--space-2)" }}>
          Add a new location
        </Button>
      )}
    </>
  );

  if (isMobile) {
    return (
      <BottomSheet open={open} onClose={onClose} title="Deliver to">
        {body}
      </BottomSheet>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Deliver to" size="md">
      {body}
    </Modal>
  );
}
