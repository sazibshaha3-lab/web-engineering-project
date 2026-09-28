import Textarea from "../forms/Textarea";

export default function DeliveryInstructions({ value, onChange }) {
  return (
    <Textarea
      label="Delivery instructions (optional)"
      placeholder="Gate number, floor, landmark, or any instruction for the rider."
      rows={3}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
