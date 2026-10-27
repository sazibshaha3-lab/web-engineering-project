import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search, ArrowRight } from "lucide-react";
import Button from "../common/Button";
import "./SearchBar.css";

export default function SearchBar({ variant = "hero" }) {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [query, setQuery] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (location.trim()) params.set("location", location.trim());
    const search = params.toString();
    navigate(`/customer/restaurants${search ? `?${search}` : ""}`);
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
      <Button
        type="submit"
        variant="primary"
        size="md"
        icon={ArrowRight}
        iconPosition="right"
        className="search-bar__submit"
        aria-label="Search"
      >
        Find food
      </Button>
    </form>
  );
}
