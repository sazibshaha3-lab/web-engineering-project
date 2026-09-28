import { useParams, useNavigate, Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import ErrorState from "../../components/common/ErrorState";
import ApprovalActionButtons from "../../components/admin/ApprovalActionButtons";
import RestaurantDetails from "../../components/admin/RestaurantDetails";
import { useAdmin } from "../../context/AdminContext";
import "./admin-shared.css";

export default function AdminRestaurantDetails() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { allRestaurants, foods, orders, approveRestaurant, rejectRestaurant, blockRestaurant, unblockRestaurant } = useAdmin();

  const restaurant = allRestaurants.find((r) => r.id === restaurantId);

  if (!restaurant) {
    return (
      <ErrorState
        title="Restaurant not found"
        description="We couldn't find a restaurant with that ID."
        onRetry={() => navigate("/admin/restaurants")}
        actionLabel="Back to Restaurants"
      />
    );
  }

  const menu = foods.filter((f) => f.restaurantId === restaurant.id);
  const restaurantOrders = orders.filter((o) => o.restaurantId === restaurant.id);

  return (
    <div className="fade-in">
      <PageHeader
        title={restaurant.name}
        description="Restaurant account details."
        actions={
          <ApprovalActionButtons
            status={restaurant.blocked ? "BLOCKED" : restaurant.approvalStatus}
            entityLabel={restaurant.name}
            onApprove={() => approveRestaurant(restaurant.id)}
            onReject={() => rejectRestaurant(restaurant.id)}
            onBlock={() => blockRestaurant(restaurant.id)}
            onUnblock={() => unblockRestaurant(restaurant.id)}
          />
        }
      />

      <RestaurantDetails restaurant={restaurant} menu={menu} orders={restaurantOrders} />

      <Link to="/admin/restaurants" className="admin-back-link">
        ← Back to restaurants
      </Link>
    </div>
  );
}
