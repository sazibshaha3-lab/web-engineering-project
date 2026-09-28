import "./PasswordStrength.css";

function scorePassword(pw = "") {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const levels = [
  { label: "Too short", tone: "error" },
  { label: "Weak", tone: "error" },
  { label: "Fair", tone: "warning" },
  { label: "Good", tone: "warning" },
  { label: "Strong", tone: "success" },
];

export default function PasswordStrength({ password = "" }) {
  if (!password) return null;
  const score = scorePassword(password);
  const level = levels[score];

  return (
    <div className="password-strength">
      <div className="password-strength__bars">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`password-strength__bar ${i < score ? `is-${level.tone}` : ""}`} />
        ))}
      </div>
      <span className={`password-strength__label password-strength__label--${level.tone}`}>{level.label}</span>
    </div>
  );
}
