import { Wallet, CreditCard } from "lucide-react";
import "./PaymentMethodSelector.css";

const options = [
  {
    value: "cod",
    icon: Wallet,
    label: "Cash on Delivery",
    desc: "Pay when your order arrives.",
  },
  {
    value: "online",
    icon: CreditCard,
    label: "Online Payment",
    desc: "Mock payment for the current frontend phase.",
  },
];

export default function PaymentMethodSelector({ value, onChange }) {
  return (
    <div className="payment-selector" role="radiogroup" aria-label="Payment method">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`payment-option ${value === opt.value ? "is-selected" : ""}`}
          onClick={() => onChange(opt.value)}
          role="radio"
          aria-checked={value === opt.value}
        >
          <span className="payment-option__icon">
            <opt.icon size={18} strokeWidth={2} />
          </span>
          <span>
            <span className="payment-option__label" style={{ display: "block" }}>{opt.label}</span>
            <span className="payment-option__desc">{opt.desc}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
