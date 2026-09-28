import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Button from "../common/Button";
import Logo from "../common/Logo";
import "./Navbar.css";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/customer/restaurants", label: "Restaurants" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand" onClick={() => setMenuOpen(false)}>
          <Logo />
        </Link>

        <nav className="navbar__links" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `navbar__link ${isActive ? "is-active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__actions">
          <Button as={Link} to="/login" variant="ghost" size="sm">
            Log in
          </Button>
          <Button as={Link} to="/register" variant="primary" size="sm">
            Sign up
          </Button>
        </div>

        <button
          className="navbar__toggle"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className={`navbar__mobile ${menuOpen ? "is-open" : ""}`}>
        <nav aria-label="Mobile">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className="navbar__mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="navbar__mobile-actions">
          <Button as={Link} to="/login" variant="secondary" fullWidth onClick={() => setMenuOpen(false)}>
            Log in
          </Button>
          <Button as={Link} to="/register" variant="primary" fullWidth onClick={() => setMenuOpen(false)}>
            Sign up
          </Button>
        </div>
      </div>
    </header>
  );
}
