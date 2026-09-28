import "./AuthIllustration.css";

const content = {
  login: {
    heading: "Good food is worth the wait — but not too long.",
    sub: "Log back in to pick up right where your last order left off.",
  },
  register: {
    heading: "Campus kitchens, hostel messes, and everything between.",
    sub: "Create an account once and order from anywhere near you.",
  },
  "verify-otp": {
    heading: "One quick check before we let you in.",
    sub: "This keeps your CampusEats account secure.",
  },
};

export default function AuthIllustration({ variant = "login" }) {
  const copy = content[variant] || content.login;

  return (
    <div className="auth-illustration">
      <div className="auth-illustration__art" aria-hidden="true">
        <svg viewBox="0 0 320 320" width="100%" height="100%">
          <circle cx="160" cy="160" r="150" fill="var(--color-primary-light)" opacity="0.5" />
          <circle cx="230" cy="90" r="46" fill="var(--color-accent)" opacity="0.85" />
          <rect x="60" y="150" width="150" height="110" rx="20" fill="var(--color-surface)" />
          <rect x="78" y="170" width="114" height="14" rx="7" fill="var(--color-border)" />
          <rect x="78" y="194" width="80" height="10" rx="5" fill="var(--color-border)" />
          <circle cx="150" cy="230" r="18" fill="var(--color-primary)" />
          <path d="M143 230l5 5 10-11" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="200" y="200" width="66" height="66" rx="18" fill="var(--color-secondary)" opacity="0.9" />
          <path d="M222 232h22M233 221v22" stroke="var(--color-text-inverse)" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="auth-illustration__heading">{copy.heading}</h2>
      <p className="auth-illustration__sub">{copy.sub}</p>
    </div>
  );
}
