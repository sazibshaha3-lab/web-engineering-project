import "./Logo.css";

export default function Logo({ compact = false }) {
  return (
    <span className="logo">
      <span className="logo__mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" width="34" height="34">
          <rect width="40" height="40" rx="11" fill="var(--color-primary)" />
          <path
            d="M13 12v9a4 4 0 0 0 4 4v9a1.4 1.4 0 0 0 2.8 0v-9a4 4 0 0 0 4-4v-9a1.4 1.4 0 0 0-2.8 0v7.3a.7.7 0 0 1-1.4 0V12a1.4 1.4 0 0 0-2.8 0v7.3a.7.7 0 0 1-1.4 0V12a1.4 1.4 0 0 0-2.4-1Z"
            fill="var(--color-text-inverse)"
          />
          <path
            d="M27.6 12c-2.7 0-4.6 2.7-4.6 6.6 0 3.4 1.5 5.8 3.4 6.4V30a1.2 1.2 0 0 0 2.4 0V13.2a1.2 1.2 0 0 0-1.2-1.2Z"
            fill="var(--color-text-inverse)"
          />
        </svg>
      </span>
      {!compact && <span className="logo__text">CampusEats</span>}
    </span>
  );
}
