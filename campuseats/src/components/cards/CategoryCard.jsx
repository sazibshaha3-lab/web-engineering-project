import { Link } from "react-router-dom";
import ImageWithFallback from "../common/ImageWithFallback";
import "./CategoryCard.css";

export default function CategoryCard({ category }) {
  return (
    <Link to={`/customer/restaurants?category=${category.id}`} className="category-card">
      <span className="category-card__media">
        <ImageWithFallback src={category.image} alt={category.name} ratio="1 / 1" />
      </span>
      <span className="category-card__name">{category.name}</span>
    </Link>
  );
}
