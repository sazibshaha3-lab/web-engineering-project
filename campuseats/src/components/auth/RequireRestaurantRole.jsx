import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RequireRestaurantRole() {
  const { user, authLoading } = useAuth();

  if (authLoading) return null;

  if (!user || user.role !== "restaurant") {
    return <Navigate to="/login" replace />;
  }

  const approvalStatus = user.restaurant?.approvalStatus ?? user.restaurant?.approval_status;
  if (approvalStatus !== "APPROVED" || user.restaurant?.blocked) {
    return <Navigate to="/restaurant/pending" replace />;
  }

  return <Outlet />;
}
