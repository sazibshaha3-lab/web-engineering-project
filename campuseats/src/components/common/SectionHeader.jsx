import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import "./SectionHeader.css";

export default function SectionHeader({ title, description, linkTo, linkLabel = "See all" }) {
  return (
    <div className="section-header">
      <div>
        <h2 className="section-header__title">{title}</h2>
        {description && <p className="section-header__desc">{description}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo} className="section-header__link">
          {linkLabel}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
