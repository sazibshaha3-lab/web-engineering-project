import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import EmptyState from "../common/EmptyState";
import Button from "../common/Button";

export default function EmptyCart() {
  return (
    <div className="fade-in">
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Add something delicious from a nearby restaurant to get started."
        action={
          <Button as={Link} to="/customer/restaurants">
            Browse Restaurants
          </Button>
        }
      />
    </div>
  );
}
