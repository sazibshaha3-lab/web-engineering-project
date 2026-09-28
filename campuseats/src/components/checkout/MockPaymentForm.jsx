import { ShieldCheck } from "lucide-react";
import Input from "../forms/Input";
import "./MockPaymentForm.css";

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function MockPaymentForm({ form, onChange, errors }) {
  return (
    <div className="mock-payment">
      <span className="mock-payment__badge">
        <ShieldCheck size={13} strokeWidth={2.4} /> Demo / Mock Payment
      </span>

      <Input
        label="Cardholder name"
        placeholder="Name on card"
        value={form.name}
        onChange={(e) => onChange({ ...form, name: e.target.value })}
        error={errors.name}
      />
      <Input
        label="Card number"
        placeholder="4242 4242 4242 4242"
        inputMode="numeric"
        value={form.number}
        onChange={(e) => onChange({ ...form, number: formatCardNumber(e.target.value) })}
        error={errors.number}
      />
      <div className="mock-payment__row">
        <Input
          label="Expiry"
          placeholder="MM/YY"
          inputMode="numeric"
          value={form.expiry}
          onChange={(e) => onChange({ ...form, expiry: formatExpiry(e.target.value) })}
          error={errors.expiry}
        />
        <Input
          label="CVV"
          placeholder="123"
          inputMode="numeric"
          type="password"
          value={form.cvv}
          onChange={(e) => onChange({ ...form, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })}
          error={errors.cvv}
        />
      </div>
      <p className="mock-payment__hint">
        Demo card: 4242 4242 4242 4242 succeeds. Use 4000 0000 0000 0002 to preview a failed payment.
      </p>
    </div>
  );
}
