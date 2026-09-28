import "./StatCard.css";

export default function StatCard({ icon: Icon, label, value, trend, tone = "primary" }) {
  return (
    <div className="stat-card">
      <span className={`stat-card__icon stat-card__icon--${tone}`}>
        <Icon size={20} strokeWidth={2} />
      </span>
      <div>
        <p className="stat-card__value">{value}</p>
        <p className="stat-card__label">{label}</p>
        {trend && <p className="stat-card__trend">{trend}</p>}
      </div>
    </div>
  );
}
