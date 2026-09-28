import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import "./Breadcrumb.css";

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={item.label} className="breadcrumb__item">
            {item.to && !last ? <Link to={item.to}>{item.label}</Link> : <span aria-current={last ? "page" : undefined}>{item.label}</span>}
            {!last && <ChevronRight size={14} className="breadcrumb__sep" />}
          </span>
        );
      })}
    </nav>
  );
}
