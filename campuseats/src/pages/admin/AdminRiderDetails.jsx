import { useParams, useNavigate, Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import ErrorState from "../../components/common/ErrorState";
import ApprovalActionButtons from "../../components/admin/ApprovalActionButtons";
import RiderDetails from "../../components/admin/RiderDetails";
import { useAdmin } from "../../context/AdminContext";
import "./admin-shared.css";

export default function AdminRiderDetails() {
  const { riderId } = useParams();
  const navigate = useNavigate();
  const { riders, orders, liveRiderIsAvailable, approveRider, rejectRider, blockRider, unblockRider } = useAdmin();

  const rider = riders.find((r) => r.id === riderId);

  if (!rider) {
    return (
      <ErrorState
        title="Rider not found"
        description="We couldn't find a rider with that ID."
        onRetry={() => navigate("/admin/riders")}
        actionLabel="Back to Riders"
      />
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        title={rider.name}
        description="Rider account details."
        actions={
          <ApprovalActionButtons
            status={rider.approvalStatus}
            entityLabel={rider.name}
            onApprove={() => approveRider(rider.id)}
            onReject={() => rejectRider(rider.id)}
            onBlock={() => blockRider(rider.id)}
            onUnblock={() => unblockRider(rider.id)}
          />
        }
      />

      <RiderDetails rider={rider} orders={orders} isAvailable={liveRiderIsAvailable} />

      <Link to="/admin/riders" className="admin-back-link">
        ← Back to riders
      </Link>
    </div>
  );
}
