import { Star } from "lucide-react";
import "./RestaurantReviews.css";

function Stars({ rating, size = 13 }) {
  return (
    <span className="restaurant-reviews__stars" style={{ fontSize: 0 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={0}
          fill={i < Math.round(rating) ? "currentColor" : "var(--color-border-strong)"}
        />
      ))}
    </span>
  );
}

export default function RestaurantReviews({ restaurant, reviews }) {
  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
    return { star, pct };
  });

  return (
    <section className="restaurant-reviews">
      <h3 style={{ font: "var(--text-h2)", fontSize: "1.25rem", marginBottom: "var(--space-4)" }}>
        Ratings &amp; reviews
      </h3>

      <div className="restaurant-reviews__summary">
        <div className="restaurant-reviews__score">
          <strong>{restaurant.rating}</strong>
          <Stars rating={restaurant.rating} size={16} />
          <span>{restaurant.reviewCount} reviews</span>
        </div>
        <div className="restaurant-reviews__bars">
          {breakdown.map((row) => (
            <div className="restaurant-reviews__bar-row" key={row.star}>
              <span>{row.star}★</span>
              <span className="restaurant-reviews__bar-track">
                <span className="restaurant-reviews__bar-fill" style={{ width: `${row.pct}%` }} />
              </span>
              <span>{row.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="restaurant-reviews__list">
          {reviews.slice(0, 4).map((review) => (
            <div className="restaurant-review-card" key={review.id}>
              <div className="restaurant-review-card__top">
                <span className="restaurant-review-card__author">{review.author}</span>
                <span className="restaurant-review-card__days">{review.daysAgo}d ago</span>
              </div>
              <Stars rating={review.rating} />
              <p>{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
