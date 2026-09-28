import { useState } from "react";
import { UserCog, Pencil } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Avatar from "../../components/common/Avatar";
import Button from "../../components/common/Button";
import Input from "../../components/forms/Input";
import { Badge } from "../../components/common/Badge";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/feedback/ToastContext";
import "./admin-shared.css";

export default function AdminProfile() {
  const { user, updateAdminProfile } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Enter a name.";
    if (!form.phone.trim()) next.phone = "Enter a phone number.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    setTimeout(() => {
      updateAdminProfile(form);
      setSaving(false);
      setEditing(false);
      toast?.showToast("Profile updated successfully", "success");
    }, 400);
  }

  return (
    <div className="fade-in">
      <PageHeader icon={UserCog} title="Admin Profile" description={editing ? "Update your account details." : "Your Platform Admin account."} />

      {editing ? (
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-6)",
            maxWidth: 480,
          }}
        >
          <form onSubmit={handleSubmit}>
            <Input label="Full name" value={form.name} onChange={(e) => update("name", e.target.value)} error={errors.name} />
            <Input label="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} error={errors.phone} />
            <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-4)" }}>
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="dashboard-panel admin-detail__panel" style={{ maxWidth: 480 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-5)", marginBottom: "var(--space-5)" }}>
            <Avatar name={user?.name} size="lg" />
            <div>
              <h2 style={{ font: "var(--text-h3)", marginBottom: 4 }}>{user?.name}</h2>
              <Badge tone="primary">Super Admin</Badge>
            </div>
          </div>
          <div className="admin-detail__field">
            <span>Email</span>
            <span>{user?.email}</span>
          </div>
          <div className="admin-detail__field">
            <span>Phone</span>
            <span>{user?.phone}</span>
          </div>
          <div className="admin-detail__field">
            <span>Role</span>
            <span>Platform Admin</span>
          </div>
          <Button variant="secondary" icon={Pencil} onClick={() => setEditing(true)} style={{ marginTop: "var(--space-5)" }}>
            Edit profile
          </Button>
        </div>
      )}
    </div>
  );
}
