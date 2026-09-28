import "./SkeletonLoader.css";

export function SkeletonBlock({ width, height = "1rem", radius = "6px", style }) {
  return <span className="skeleton" style={{ width, height, borderRadius: radius, ...style }} />;
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <SkeletonBlock height="140px" radius="var(--radius-md)" />
      <SkeletonBlock width="70%" height="1rem" />
      <SkeletonBlock width="45%" height="0.85rem" />
      <SkeletonBlock width="55%" height="0.85rem" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="skeleton-row">
      <SkeletonBlock width="42px" height="42px" radius="50%" />
      <div className="skeleton-row__lines">
        <SkeletonBlock width="60%" height="0.9rem" />
        <SkeletonBlock width="35%" height="0.8rem" />
      </div>
    </div>
  );
}
