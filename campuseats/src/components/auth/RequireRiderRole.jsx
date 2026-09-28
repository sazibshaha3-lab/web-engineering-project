import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RequireRiderRole() {
  const { user } = useAuth();

  if (!user || user.role !== "rider") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
