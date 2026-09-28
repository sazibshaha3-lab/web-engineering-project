import { Link } from "react-router-dom";
import { Star, Clock } from "lucide-react";
import ImageWithFallback from "../common/ImageWithFallback";
import { Badge } from "../common/Badge";
import "./RestaurantCard.css";

export default function RestaurantCard({ restaurant }) {
  const { id, name, image, rating, reviewCount, category, deliveryTime, deliveryFee, isOpen } = restaurant;

  return (
    <Link to={`/customer/restaurant/${id}`} className="restaurant-card">
      <div className="restaurant-card__media">
        <ImageWithFallback src={image} alt={name} ratio="4 / 3" />
        <span className="restaurant-card__status">
          <Badge tone={isOpen ? "success" : "neutral"}>{isOpen ? "Open now" : "Closed"}</Badge>
        </span>
      </div>
      <div className="restaurant-card__body">
        <div className="restaurant-card__top">
          <h3 className="restaurant-card__name">{name}</h3>
          <span className="restaurant-card__rating">
            <Star size={14} fill="currentColor" strokeWidth={0} />
            {rating}
          </span>
        </div>
        <p className="restaurant-card__meta">
          {category} · {reviewCount} reviews
        </p>
        <div className="restaurant-card__footer">
          <span>
            <Clock size={14} strokeWidth={2} /> {deliveryTime}
          </span>
          <span>৳{deliveryFee} delivery</span>
        </div>
      </div>
    </Link>
  );
}
