import { ClipboardList, Clock, CheckCircle2, Wallet } from "lucide-react";
import StatCard from "../cards/StatCard";

export default function DashboardStats({ todaysOrders, pendingOrders, completedOrders, todaysRevenue }) {
  return (
    <div className="grid grid--stats">
      <StatCard
        icon={ClipboardList}
        label="Today's orders"
        value={todaysOrders}
        tone="primary"
        badge="Today"
      />
      <StatCard
        icon={Clock}
        label="Pending orders"
        value={pendingOrders}
        tone="accent"
        badge={pendingOrders > 0 ? "Active now" : "All clear"}
      />
      <StatCard
        icon={CheckCircle2}
        label="Completed orders"
        value={completedOrders}
        tone="secondary"
        badge="Delivered"
      />
      <StatCard
        icon={Wallet}
        label="Today's revenue"
        value={`৳${todaysRevenue}`}
        tone="info"
        badge="Earnings"
      />
    </div>
  );
}
