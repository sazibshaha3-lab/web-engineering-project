import { useState } from "react";
import { Heart, Share2, Star } from "lucide-react";
import ImageWithFallback from "../common/ImageWithFallback";
import { useToast } from "../feedback/ToastContext";
import "./RestaurantHero.css";

export default function RestaurantHero({ restaurant }) {
  const [favorited, setFavorited] = useState(false);
  const toast = useToast();

  function toggleFavorite() {
    setFavorited((f) => {
      const next = !f;
      toast?.showToast(next ? "Added to favourites" : "Removed from favourites", "success");
      return next;
    });
  }

  async function handleShare() {
    const shareData = {
      title: restaurant.name,
      text: `Check out ${restaurant.name} on CampusEats`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast?.showToast("Restaurant link copied to clipboard", "success");
      }
    } catch {
      // user cancelled the native share sheet — no need to surface an error
    }
  }

  return (
    <div className="restaurant-hero">
      <div className="restaurant-hero__cover">
        <ImageWithFallback
          src={restaurant.image}
          alt={restaurant.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div className="restaurant-hero__scrim" />
        {!restaurant.isOpen && <span className="restaurant-hero__closed-ribbon">Closed</span>}
        <div className="restaurant-hero__actions">
          <button
            className={favorited ? "is-favorited" : ""}
            onClick={toggleFavorite}
            aria-pressed={favorited}
            aria-label={favorited ? "Remove from favourites" : "Add to favourites"}
          >
            <Heart size={18} strokeWidth={2.2} fill={favorited ? "currentColor" : "none"} />
          </button>
          <button onClick={handleShare} aria-label="Share this restaurant">
            <Share2 size={18} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <div className="restaurant-hero__body">
        <span className="restaurant-hero__logo">
          <ImageWithFallback src={restaurant.logo} alt="" ratio="1 / 1" />
        </span>
        <div className="restaurant-hero__info">
          <div className="restaurant-hero__top">
            <h1 className="restaurant-hero__name">{restaurant.name}</h1>
          </div>
          <p className="restaurant-hero__desc">{restaurant.description}</p>
          <div className="restaurant-hero__meta">
            <span className="is-rating">
              <Star size={15} fill="currentColor" strokeWidth={0} />
              {restaurant.rating} ({restaurant.reviewCount} reviews)
            </span>
            <span>{restaurant.category}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
