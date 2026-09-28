import "./Avatar.css";

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export default function Avatar({ name, src, size = "md" }) {
  return (
    <span className={`avatar avatar--${size}`}>
      {src ? (
        <img src={src} alt={name} onError={(e) => (e.currentTarget.style.display = "none")} />
      ) : (
        <span className="avatar__initials">{initials(name) || "?"}</span>
      )}
    </span>
  );
}
