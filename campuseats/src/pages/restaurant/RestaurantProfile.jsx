import { useState } from "react";
import { Pencil, Store } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import ImageWithFallback from "../../components/common/ImageWithFallback";
import ProfileForm from "../../components/restaurant/ProfileForm";
import { useRestaurantData } from "../../context/RestaurantContext";
import "./RestaurantProfile.css";

export default function RestaurantProfile() {
  const { restaurant, isOpen } = useRestaurantData();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="fade-in">
        <PageHeader icon={Store} title="Edit restaurant profile" description="These details are shown to customers browsing CampusEats." />
        <div className="rprofile__panel">
          <ProfileForm onDone={() => setEditing(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="rprofile__cover">
        <ImageWithFallback src={restaurant.image} alt={restaurant.name} ratio="16 / 9" />
        <span className="rprofile__logo">
          <ImageWithFallback src={restaurant.logo} alt="" ratio="1 / 1" />
        </span>
      </div>

      <div className="rprofile__header">
        <div>
          <h1 className="rprofile__name">{restaurant.name}</h1>
          <p className="rprofile__meta">{restaurant.category} · {restaurant.address}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <Badge tone={isOpen ? "success" : "neutral"}>{isOpen ? "Open" : "Closed"}</Badge>
          <Button icon={Pencil} onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="rprofile__panel">
        <p className="rprofile__desc">{restaurant.description}</p>

        <div className="rprofile__grid">
          <div className="rprofile__field">
            <span>Delivery fee</span>
            <strong>৳{restaurant.deliveryFee}</strong>
          </div>
          <div className="rprofile__field">
            <span>Minimum order</span>
            <strong>৳{restaurant.minimumOrder}</strong>
          </div>
          <div className="rprofile__field">
            <span>Delivery time</span>
            <strong>{restaurant.deliveryTime}</strong>
          </div>
          <div className="rprofile__field">
            <span>Opening time</span>
            <strong>{restaurant.openingTime}</strong>
          </div>
          <div className="rprofile__field">
            <span>Closing time</span>
            <strong>{restaurant.closingTime}</strong>
          </div>
          <div className="rprofile__field">
            <span>Rating</span>
            <strong>{restaurant.rating} ({restaurant.reviewCount} reviews)</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
