import { useEffect } from "react";
import { X } from "lucide-react";
import "./BottomSheet.css";

export default function BottomSheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="bottom-sheet-overlay" onMouseDown={onClose}>
      <div
        className="bottom-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <span className="bottom-sheet__grabber" aria-hidden="true" />
        <div className="bottom-sheet__header">
          <h3>{title}</h3>
          <button onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="bottom-sheet__body">{children}</div>
      </div>
    </div>
  );
}
