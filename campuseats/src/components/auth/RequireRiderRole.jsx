import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RequireRiderRole() {
  const { user, authLoading } = useAuth();

  if (authLoading) return null;

  if (!user || user.role !== "rider") {
    return <Navigate to="/login" replace />;
  }

  const approvalStatus = user.rider?.approvalStatus ?? user.rider?.approval_status;
  if (approvalStatus !== "APPROVED") {
    return <Navigate to="/rider/pending" replace />;
  }

  return <Outlet />;
}
