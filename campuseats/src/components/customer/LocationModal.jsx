import { Link } from "react-router-dom";
import { MapPin, ChevronRight } from "lucide-react";
import Modal from "../feedback/Modal";
import BottomSheet from "../common/BottomSheet";
import Button from "../common/Button";
import useMediaQuery from "../../hooks/useMediaQuery";
import "./LocationModal.css";

export default function LocationModal({ open, onClose, locations, selectedId, user, isLoading, loadError, onSelect }) {
  const isMobile = useMediaQuery("(max-width: 719px)");

  const body = (
    <>
      <p className="location-modal__section-title">Saved locations</p>
      {!user ? (
        <div className="location-modal__empty">
          <p>Log in to save delivery addresses.</p>
          <Button as={Link} to="/login" onClick={onClose}>Log in</Button>
        </div>
      ) : isLoading ? <p role="status">Loading addresses...</p>
        : loadError ? <p role="alert">{loadError}</p>
          : locations.length === 0 ? (
            <div className="location-modal__empty">
              <p>Add a delivery address to choose where your order goes.</p>
              <Button as={Link} to="/customer/locations" onClick={onClose}>Add address</Button>
            </div>
          ) : locations.map((loc) => (
        <div
          key={loc.id}
          className={`location-modal__row ${loc.id === selectedId ? "is-selected" : ""}`}
          onClick={() => { onSelect(loc); onClose(); }}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => event.key === "Enter" && (onSelect(loc), onClose())}
        >
          <span className="location-modal__row-icon">
            <MapPin size={16} strokeWidth={2} />
          </span>
          <span className="location-modal__row-text">
            <strong>{loc.label}</strong>
            <span>{loc.line}</span>
            {loc.isDefault && <span>Default location</span>}
          </span>
          {loc.id === selectedId && <span aria-label="Selected">Selected</span>}
          <ChevronRight size={16} color="var(--color-text-muted)" />
        </div>
      ))}
      {user && <Button as={Link} to="/customer/locations" variant="ghost" onClick={onClose} style={{ marginTop: "var(--space-2)" }}>Manage addresses</Button>}
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
