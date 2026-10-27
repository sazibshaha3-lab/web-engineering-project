import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import AddressSection from "../../components/checkout/AddressSection";
import { useAuth } from "../../context/AuthContext";
import "./Locations.css";

export default function Locations() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="fade-in">
        <PageHeader icon={MapPin} title="Saved locations" description="Manage the addresses you deliver to most often." />
        <div className="location-card">
          <div className="location-card__info">
            <p style={{ fontWeight: 600, marginBottom: 4 }}>Log in to save delivery addresses</p>
            <p>Sign in to add and manage your delivery addresses.</p>
          </div>
          <Button as={Link} to="/login">Log in</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        icon={MapPin}
        title="Saved locations"
        description="Manage the addresses you deliver to most often."
      />
      <AddressSection />
    </div>
  );
}
