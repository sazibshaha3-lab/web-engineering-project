import "./StatCard.css";

export default function StatCard({ icon: Icon, label, value, trend, tone = "primary", badge }) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__top">
        <span className={`stat-card__icon stat-card__icon--${tone}`}>
          <Icon size={22} strokeWidth={2.2} />
        </span>
        {badge && <span className={`stat-card__badge stat-card__badge--${tone}`}>{badge}</span>}
      </div>
      <div className="stat-card__body">
        <p className="stat-card__value">{value}</p>
        <p className="stat-card__label">{label}</p>
        {trend && <p className="stat-card__trend">{trend}</p>}
      </div>
    </div>
  );
}
