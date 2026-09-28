import "./PageHeader.css";

export default function PageHeader({ eyebrow, title, description, actions, icon: Icon }) {
  return (
    <div className="page-header">
      <div className="page-header__text">
        {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
        <div className="page-header__title-row">
          {Icon && (
            <span className="page-header__icon">
              <Icon size={20} strokeWidth={2} />
            </span>
          )}
          <h1 className="page-header__title">{title}</h1>
        </div>
        {description && <p className="page-header__desc">{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
}
