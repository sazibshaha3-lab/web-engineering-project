import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import Textarea from "../forms/Textarea";
import Button from "../common/Button";
import { useOrders } from "../../context/OrderContext";
import "./RatingReview.css";

function StarPicker({ value, onChange, label }) {
  return (
    <div className="rating-review__field">
      <span className="rating-review__label">{label}</span>
      <div className="rating-review__stars" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`rating-review__star ${n <= value ? "is-filled" : ""}`}
            onClick={() => onChange(n)}
            role="radio"
            aria-checked={n === value}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Star size={26} strokeWidth={1.6} fill={n <= value ? "currentColor" : "none"} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RatingReview({ order }) {
  const { submitReview } = useOrders();
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [foodRating, setFoodRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitted, setSubmitted] = useState(Boolean(order.review));

  function handleSubmit(e) {
    e.preventDefault();
    if (restaurantRating === 0) return;
    submitReview(order.id, {
      restaurantRating,
      foodRating,
      text: reviewText,
      submittedAt: new Date().toISOString(),
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rating-review__success">
        <span className="rating-review__success-icon">
          <CheckCircle2 size={26} strokeWidth={1.8} />
        </span>
        <h3 style={{ font: "var(--text-h3)", marginBottom: "var(--space-2)" }}>Thank you for your review!</h3>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
          Your feedback helps other students choose great food.
        </p>
      </div>
    );
  }

  return (
    <form className="rating-review" onSubmit={handleSubmit}>
      <StarPicker label="Rate the restaurant" value={restaurantRating} onChange={setRestaurantRating} />
      <StarPicker label="Rate the food (optional)" value={foodRating} onChange={setFoodRating} />
      <div className="rating-review__field">
        <Textarea
          label="Write a review (optional)"
          placeholder="Tell others what you liked about this order..."
          rows={3}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={restaurantRating === 0}>
        Submit Review
      </Button>
    </form>
  );
}
