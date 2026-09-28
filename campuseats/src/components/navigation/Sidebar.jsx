import { NavLink } from "react-router-dom";
import Logo from "../common/Logo";
import "./Sidebar.css";

export default function Sidebar({ sections, open, onClose }) {
  return (
    <>
      {open && <div className="sidebar__scrim" onClick={onClose} />}
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar__brand">
          <Logo compact />
          <span className="sidebar__brand-text">CampusEats</span>
        </div>
        <nav className="sidebar__nav">
          {sections.map((section) => (
            <div key={section.title} className="sidebar__section">
              <p className="sidebar__section-title">{section.title}</p>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) => `sidebar__link ${isActive ? "is-active" : ""}`}
                >
                  <item.icon size={18} strokeWidth={2} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
