import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RequireRestaurantRole() {
  const { user } = useAuth();

  if (!user || user.role !== "restaurant") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
