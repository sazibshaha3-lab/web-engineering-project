import { useState } from "react";
import { UserRound } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Avatar from "../../components/common/Avatar";
import Input from "../../components/forms/Input";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/feedback/ToastContext";
import "./Profile.css";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    const result = await updateProfile(form);
    setSaving(false);
    toast?.showToast(result.success ? "Profile updated" : result.message, result.success ? "success" : "error");
  }
  return (
    <div className="fade-in">
      <PageHeader icon={UserRound} title="Your profile" description="Manage your personal details." />

      <div className="profile-card">
        {user && <Avatar name={user.name} size="lg" />}
        <div>
          <h2 style={{ font: "var(--text-h3)" }}>{user?.name || "Your account"}</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{user?.email || ""}</p>
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <Input label="Full name" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} required maxLength={255} />
        <Input label="Email address" type="email" value={user?.email || ""} readOnly />
        <Input label="Phone number" type="tel" value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} maxLength={20} />
        <Button type="submit" disabled={saving} loading={saving}>Save changes</Button>
      </form>
    </div>
  );
}
