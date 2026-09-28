import "./RestaurantCategoryNav.css";

export default function RestaurantCategoryNav({ categories, active, onSelect }) {
  if (!categories.length) return null;

  return (
    <nav className="category-nav" aria-label="Menu categories">
      <button
        className={`category-nav__pill ${active === "all" ? "is-active" : ""}`}
        onClick={() => onSelect("all")}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          className={`category-nav__pill ${active === cat ? "is-active" : ""}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </nav>
  );
}
