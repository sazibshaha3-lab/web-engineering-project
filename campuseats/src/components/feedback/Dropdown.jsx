import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dropdown.css";

export default function Dropdown({ trigger, items = [], align = "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="dropdown" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div className={`dropdown__menu dropdown__menu--${align}`} role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              className={`dropdown__item ${item.danger ? "dropdown__item--danger" : ""}`}
              onClick={() => {
                item.onClick?.();
                if (item.to) navigate(item.to);
                setOpen(false);
              }}
              role="menuitem"
            >
              {item.icon && <item.icon size={16} strokeWidth={2} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
