import { useState } from "react";
import Input from "../forms/Input";
import Select from "../forms/Select";
import Button from "../common/Button";
import { useRider } from "../../context/RiderContext";
import { useToast } from "../feedback/ToastContext";

const vehicleOptions = [
  { value: "Motorcycle", label: "Motorcycle" },
  { value: "Bicycle", label: "Bicycle" },
  { value: "Scooter", label: "Scooter" },
];

export default function RiderProfileForm({ onDone }) {
  const { rider, updateRiderProfile } = useRider();
  const toast = useToast();
  const [form, setForm] = useState({
    name: rider.name,
    phone: rider.phone,
    vehicleType: rider.vehicleType,
    vehicleNumber: rider.vehicleNumber,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Enter your name.";
    if (!form.phone.trim()) next.phone = "Enter your phone number.";
    if (!form.vehicleType) next.vehicleType = "Choose a vehicle type.";
    if (!form.vehicleNumber.trim()) next.vehicleNumber = "Enter your vehicle number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setTimeout(() => {
      updateRiderProfile(form);
      setSaving(false);
      toast?.showToast("Profile updated successfully", "success");
      onDone?.();
    }, 500);
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", maxWidth: 480 }}>
      <Input label="Name" value={form.name} onChange={(e) => update("name", e.target.value)} error={errors.name} />
      <Input label="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} error={errors.phone} />
      <Select
        label="Vehicle type"
        options={vehicleOptions}
        value={form.vehicleType}
        onChange={(e) => update("vehicleType", e.target.value)}
      />
      <Input label="Vehicle number" value={form.vehicleNumber} onChange={(e) => update("vehicleNumber", e.target.value)} error={errors.vehicleNumber} />
      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <Button type="submit" loading={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
