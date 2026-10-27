import { Navigate } from "react-router-dom";
import { Clock3, LogOut, RefreshCw } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthHeader from "../../components/auth/AuthHeader";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

export default function RestaurantApprovalPending() {
  const { user, refreshUser, logoutMock } = useAuth();
  const [checking, setChecking] = useState(false);
  const status = user?.restaurant?.approvalStatus ?? user?.restaurant?.approval_status;

  if (!user || user.role !== "restaurant") return <Navigate to="/login" replace />;
  if (status === "APPROVED" && !user.restaurant?.blocked) return <Navigate to="/restaurant" replace />;

  async function checkApproval() {
    setChecking(true);
    await refreshUser();
    setChecking(false);
  }

  const rejected = status === "REJECTED" || user.restaurant?.blocked;

  return (
    <AuthLayout variant="register">
      <div style={{ display: "grid", justifyItems: "center", gap: "var(--space-4)", textAlign: "center" }}>
        <span aria-hidden="true" style={{ color: "var(--color-primary)" }}>
          <Clock3 size={42} strokeWidth={1.7} />
        </span>
        <AuthHeader
          title={rejected ? "Restaurant application needs attention" : "Waiting for admin approval"}
          subtitle={rejected
            ? "Your restaurant account is not approved yet. Please contact the CampusEats admin team for next steps."
            : "Your restaurant request has been sent to the admin team. You can sign in, but the restaurant dashboard and menu tools will be available after approval."}
        />
        {!rejected && <Button type="button" fullWidth onClick={checkApproval} loading={checking} icon={RefreshCw}>Check approval status</Button>}
        <Button type="button" variant="secondary" fullWidth icon={LogOut} onClick={logoutMock}>Log out</Button>
      </div>
    </AuthLayout>
  );
}
