import { Wallet } from "lucide-react";
import "./PaymentMethodSelector.css";

const options = [
  {
    value: "cod",
    icon: Wallet,
    label: "Cash on Delivery",
    desc: "Pay when your order arrives.",
  },
];

export default function PaymentMethodSelector() {
  return (
    <div className="payment-selector" role="radiogroup" aria-label="Payment method">
      {options.map((opt) => (
        <div
          key={opt.value}
          className="payment-option is-selected"
          role="radio"
          aria-checked="true"
          tabIndex={0}
        >
          <span className="payment-option__icon">
            <opt.icon size={18} strokeWidth={2} />
          </span>
          <span>
            <span className="payment-option__label" style={{ display: "block" }}>{opt.label}</span>
            <span className="payment-option__desc">
              {opt.desc}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
