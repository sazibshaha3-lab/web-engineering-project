import { useState } from "react";
import { MapPin, Search, ArrowRight } from "lucide-react";
import "./SearchBar.css";

export default function SearchBar({ variant = "hero" }) {
  const [location, setLocation] = useState("");
  const [query, setQuery] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // UI only — wired up in a later step.
  }

  return (
    <form className={`search-bar search-bar--${variant}`} onSubmit={handleSubmit}>
      <div className="search-bar__segment">
        <MapPin size={18} strokeWidth={2} className="search-bar__icon" />
        <input
          type="text"
          placeholder="Hostel block, hall or address"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          aria-label="Delivery location"
        />
      </div>
      <span className="search-bar__divider" aria-hidden="true" />
      <div className="search-bar__segment search-bar__segment--grow">
        <Search size={18} strokeWidth={2} className="search-bar__icon" />
        <input
          type="text"
          placeholder="Search biryani, burgers, restaurants..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search food or restaurants"
        />
      </div>
      <button type="submit" className="search-bar__submit" aria-label="Search">
        <span>Find food</span>
        <ArrowRight size={17} strokeWidth={2.2} />
      </button>
    </form>
  );
}
