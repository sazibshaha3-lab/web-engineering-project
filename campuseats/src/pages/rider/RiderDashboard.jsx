import { Link } from "react-router-dom";
import { Bike, History, UserRound } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import RiderStats from "../../components/rider/RiderStats";
import RiderAvailabilityToggle from "../../components/rider/RiderAvailabilityToggle";
import ActiveDeliveryCard from "../../components/rider/ActiveDeliveryCard";
import RiderEmptyState from "../../components/rider/RiderEmptyState";
import Button from "../../components/common/Button";
import { useRider } from "../../context/RiderContext";
import { useRestaurantData } from "../../context/RestaurantContext";
import "./RiderDashboard.css";

const quickActions = [
  { to: "/rider/deliveries", icon: Bike, label: "Deliveries", desc: "View delivery requests" },
  { to: "/rider/history", icon: History, label: "History", desc: "See completed deliveries" },
  { to: "/rider/profile", icon: UserRound, label: "Profile", desc: "Update your rider details" },
];

export default function RiderDashboard() {
  const { rider, stats, getAssignedDeliveries } = useRider();
  const { restaurants } = useRestaurantData();

  const assigned = getAssignedDeliveries();
  const activeOrder = assigned[0] || null;
  const activeRestaurant = activeOrder ? restaurants.find((r) => r.id === activeOrder.restaurantId) : null;

  return (
    <div className="fade-in">
      <PageHeader title="Rider Dashboard" description={`Welcome back, ${rider.name.split(" ")[0]}.`} />

      <RiderAvailabilityToggle />

      <RiderStats
        todaysDeliveries={stats.todaysDeliveries}
        activeDelivery={stats.activeDelivery}
        completedDeliveries={stats.completedDeliveries}
        todaysEarnings={stats.todaysEarnings}
      />

      {activeOrder ? (
        <ActiveDeliveryCard order={activeOrder} restaurant={activeRestaurant} />
      ) : (
        <RiderEmptyState
          icon={Bike}
          title="No active delivery"
          description="Accept a delivery request to start delivering orders."
          action={
            <Button as={Link} to="/rider/deliveries">
              View Deliveries
            </Button>
          }
        />
      )}

      <div className="rdash2__quick-actions">
        {quickActions.map((action) => (
          <Link className="rdash2__quick-action" to={action.to} key={action.to}>
            <span className="rdash2__quick-action-icon">
              <action.icon size={19} strokeWidth={2} />
            </span>
            <span>
              <strong>{action.label}</strong>
              <span>{action.desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
