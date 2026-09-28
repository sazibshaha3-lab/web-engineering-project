import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Guest browsing (home, restaurant discovery, restaurant detail, cart) is
// intentionally allowed without an account. Only the account-specific
// customer pages — checkout, order history/tracking, profile, saved
// locations — require an explicit customer login. Redirects to /login
// and remembers where to send the person back afterwards.
export default function RequireCustomerAuth() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || user.role !== "customer") {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return <Outlet />;
}
