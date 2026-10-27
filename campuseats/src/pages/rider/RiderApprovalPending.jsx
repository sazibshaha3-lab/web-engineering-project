import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Clock3, LogOut, RefreshCw } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthHeader from "../../components/auth/AuthHeader";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";

export default function RiderApprovalPending() {
  const { user, refreshUser, logoutMock } = useAuth();
  const [checking, setChecking] = useState(false);
  const status = user?.rider?.approvalStatus ?? user?.rider?.approval_status;

  if (!user || user.role !== "rider") return <Navigate to="/login" replace />;
  if (status === "APPROVED") return <Navigate to="/rider" replace />;

  async function checkApproval() {
    setChecking(true);
    await refreshUser();
    setChecking(false);
  }

  const rejected = status === "REJECTED" || status === "BLOCKED";

  return (
    <AuthLayout variant="register">
      <div style={{ display: "grid", justifyItems: "center", gap: "var(--space-4)", textAlign: "center" }}>
        <span aria-hidden="true" style={{ color: "var(--color-primary)" }}>
          <Clock3 size={42} strokeWidth={1.7} />
        </span>
        <AuthHeader
          title={rejected ? "Rider application needs attention" : "Waiting for admin approval"}
          subtitle={rejected
            ? "Your rider account is not approved yet. Please contact the CampusEats admin team for next steps."
            : "Your rider request has been sent to the admin team. Delivery features will be available after approval."}
        />
        {!rejected && <Button type="button" fullWidth onClick={checkApproval} loading={checking} icon={RefreshCw}>Check approval status</Button>}
        <Button type="button" variant="secondary" fullWidth icon={LogOut} onClick={logoutMock}>Log out</Button>
      </div>
    </AuthLayout>
  );
}
