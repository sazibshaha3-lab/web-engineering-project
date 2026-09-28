import { useState } from "react";
import { UserRound } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import RiderProfileCard from "../../components/rider/RiderProfileCard";
import RiderProfileForm from "../../components/rider/RiderProfileForm";
import { useRider } from "../../context/RiderContext";

export default function RiderProfile() {
  const { rider, isAvailable } = useRider();
  const [editing, setEditing] = useState(false);

  return (
    <div className="fade-in">
      <PageHeader
        icon={UserRound}
        title="Rider Profile"
        description={editing ? "Update your rider details." : "Your delivery profile and vehicle information."}
      />

      {editing ? (
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
          <RiderProfileForm onDone={() => setEditing(false)} />
        </div>
      ) : (
        <RiderProfileCard rider={rider} isAvailable={isAvailable} onEdit={() => setEditing(true)} />
      )}
    </div>
  );
}
