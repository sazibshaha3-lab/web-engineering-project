import { Search, X } from "lucide-react";
import "./CustomerSearch.css";

export default function CustomerSearch({ value, onChange, placeholder = "Search for restaurants or dishes", size = "md" }) {
  return (
    <div className={`customer-search customer-search--${size}`}>
      <Search size={18} strokeWidth={2} className="customer-search__icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <button className="customer-search__clear" onClick={() => onChange("")} aria-label="Clear search">
          <X size={15} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
