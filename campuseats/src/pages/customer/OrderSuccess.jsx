import { Link, useLocation } from "react-router-dom";
import { PackageSearch } from "lucide-react";
import OrderSuccessCard from "../../components/order/OrderSuccess";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import { useOrders } from "../../context/OrderContext";

export default function OrderSuccessPage() {
  const location = useLocation();
  const { getOrderById, activeOrder } = useOrders();
  const order = getOrderById(location.state?.orderId) || activeOrder;

  if (!order) {
    return (
      <div className="fade-in">
        <EmptyState
          icon={PackageSearch}
          title="No recent order found"
          description="Your last order isn't available in this session anymore. Head back and place a new one."
          action={
            <Button as={Link} to="/customer/restaurants">
              Browse Restaurants
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <OrderSuccessCard order={order} />
    </div>
  );
}
