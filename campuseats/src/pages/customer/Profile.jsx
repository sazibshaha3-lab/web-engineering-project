import { UserRound } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Avatar from "../../components/common/Avatar";
import Input from "../../components/forms/Input";
import Button from "../../components/common/Button";
import { currentCustomer } from "../../data/users";
import "./Profile.css";

export default function Profile() {
  return (
    <div className="fade-in">
      <PageHeader icon={UserRound} title="Your profile" description="Manage your personal details." />

      <div className="profile-card">
        <Avatar name={currentCustomer.name} size="lg" />
        <div>
          <h2 style={{ font: "var(--text-h3)" }}>{currentCustomer.name}</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{currentCustomer.email}</p>
        </div>
      </div>

      <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
        <Input label="Full name" defaultValue={currentCustomer.name} />
        <Input label="Email address" type="email" defaultValue={currentCustomer.email} />
        <Input label="Phone number" type="tel" defaultValue={currentCustomer.phone} />
        <Button type="submit">Save changes</Button>
      </form>
    </div>
  );
}
