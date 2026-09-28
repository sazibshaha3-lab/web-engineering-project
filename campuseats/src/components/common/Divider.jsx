import "./Divider.css";

export default function Divider({ label }) {
  if (!label) return <hr className="divider" />;
  return (
    <div className="divider--labeled">
      <span />
      <p>{label}</p>
      <span />
    </div>
  );
}
