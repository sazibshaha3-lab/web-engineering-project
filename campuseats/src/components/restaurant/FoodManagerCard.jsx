import { Pencil, Trash2 } from "lucide-react";
import ImageWithFallback from "../common/ImageWithFallback";
import { Badge } from "../common/Badge";
import Switch from "../common/Switch";
import IconButton from "../common/IconButton";
import "./FoodManagerCard.css";

export default function FoodManagerCard({ food, onEdit, onDelete, onToggleAvailable, onTogglePopular }) {
  return (
    <div className="food-manager-card">
      <span className="food-manager-card__media">
        <ImageWithFallback src={food.image} alt={food.name} ratio="1 / 1" />
      </span>
      <div className="food-manager-card__body">
        <div className="food-manager-card__top">
          <p className="food-manager-card__name">{food.name}</p>
          <span className="food-manager-card__price">৳{food.price}</span>
        </div>
        <p className="food-manager-card__meta">
          {food.category} · {food.preparationTime}
          {food.isPopular && (
            <>
              {" "}
              · <Badge tone="warning">Popular</Badge>
            </>
          )}
        </p>

        <div className="food-manager-card__controls">
          <Switch checked={food.isAvailable} onChange={() => onToggleAvailable(food.id)} label="Available" size="sm" />
          <Switch checked={food.isPopular} onChange={() => onTogglePopular(food.id)} label="Popular" size="sm" />
        </div>

        <div className="food-manager-card__actions">
          <IconButton icon={Pencil} label="Edit food" variant="surface" size="sm" onClick={() => onEdit(food)} />
          <IconButton icon={Trash2} label="Delete food" variant="surface" size="sm" onClick={() => onDelete(food)} />
        </div>
      </div>
    </div>
  );
}
