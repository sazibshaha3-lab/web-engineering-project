import { useEffect, useState } from "react";
import Modal from "../feedback/Modal";
import BottomSheet from "../common/BottomSheet";
import Input from "../forms/Input";
import Select from "../forms/Select";
import Textarea from "../forms/Textarea";
import Button from "../common/Button";
import useMediaQuery from "../../hooks/useMediaQuery";
import { addressLabels } from "../../data/addresses";

const emptyForm = { label: "Home", line: "", area: "", city: "", details: "" };

export default function AddressForm({ open, onClose, onSave, initialAddress }) {
  const isMobile = useMediaQuery("(max-width: 719px)");
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initialAddress ? { ...emptyForm, ...initialAddress } : emptyForm);
      setErrors({});
    }
  }, [open, initialAddress]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate() {
    const next = {};
    if (!form.line.trim()) next.line = "Enter the address line.";
    if (!form.area.trim()) next.area = "Enter the area.";
    if (!form.city.trim()) next.city = "Enter the city.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  }

  const title = initialAddress ? "Edit address" : "Add a new address";

  const body = (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
    >
      <Select
        label="Address label"
        options={addressLabels.map((l) => ({ value: l, label: l }))}
        value={form.label}
        onChange={(e) => update("label", e.target.value)}
      />
      <Input
        label="Address line"
        placeholder="e.g. Hostel Block C, Room 214"
        value={form.line}
        onChange={(e) => update("line", e.target.value)}
        error={errors.line}
      />
      <Input
        label="Area"
        placeholder="e.g. Central Hostel Zone"
        value={form.area}
        onChange={(e) => update("area", e.target.value)}
        error={errors.area}
      />
      <Input
        label="City"
        placeholder="e.g. Campus Town"
        value={form.city}
        onChange={(e) => update("city", e.target.value)}
        error={errors.city}
      />
      <Textarea
        label="Additional details (optional)"
        placeholder="Building / floor / room, landmark, etc."
        rows={2}
        value={form.details}
        onChange={(e) => update("details", e.target.value)}
      />
      <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
        <Button type="submit" fullWidth>
          Save address
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <BottomSheet open={open} onClose={onClose} title={title}>
        {body}
      </BottomSheet>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="md">
      {body}
    </Modal>
  );
}
