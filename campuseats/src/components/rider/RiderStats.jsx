import { Bike, PackageCheck, CheckCircle2, Wallet } from "lucide-react";
import StatCard from "../cards/StatCard";

export default function RiderStats({ todaysDeliveries, activeDelivery, completedDeliveries, todaysEarnings }) {
  return (
    <div className="grid grid--stats">
      <StatCard icon={PackageCheck} label="Today's deliveries" value={todaysDeliveries} tone="primary" />
      <StatCard icon={Bike} label="Active delivery" value={activeDelivery} tone="accent" />
      <StatCard icon={CheckCircle2} label="Completed deliveries" value={completedDeliveries} tone="secondary" />
      <StatCard icon={Wallet} label="Today's earnings" value={`৳${todaysEarnings}`} tone="info" />
    </div>
  );
}
