import { Users, Store, Bike, ClipboardList, PackageCheck, CheckCircle2, XCircle, Clock } from "lucide-react";
import StatCard from "../cards/StatCard";
import { useAdmin } from "../../context/AdminContext";

export default function AdminStats() {
  const { stats } = useAdmin();

  return (
    <div className="grid grid--stats">
      <StatCard icon={Users} label="Total customers" value={stats.totalCustomers} tone="primary" />
      <StatCard icon={Store} label="Restaurants" value={stats.totalRestaurants} tone="secondary" />
      <StatCard
        icon={Clock}
        label="Pending restaurants"
        value={stats.pendingRestaurants}
        tone="accent"
        trend={stats.pendingRestaurants ? "Needs review" : undefined}
      />
      <StatCard icon={Bike} label="Total riders" value={stats.totalRiders} tone="info" />
      <StatCard
        icon={Clock}
        label="Pending riders"
        value={stats.pendingRiders}
        tone="accent"
        trend={stats.pendingRiders ? "Needs review" : undefined}
      />
      <StatCard icon={ClipboardList} label="Total orders" value={stats.totalOrders} tone="primary" />
      <StatCard icon={PackageCheck} label="Active orders" value={stats.activeOrders} tone="info" />
      <StatCard icon={CheckCircle2} label="Completed orders" value={stats.completedOrders} tone="secondary" />
      <StatCard icon={XCircle} label="Cancelled / rejected" value={stats.cancelledOrders} tone="accent" />
    </div>
  );
}
