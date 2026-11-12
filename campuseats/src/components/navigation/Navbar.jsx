import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Button from "../common/Button";
import Logo from "../common/Logo";
import "./Navbar.css";

const links = [
  { id: "home", to: "/", label: "Home" },
  { id: "restaurants", to: "/customer/restaurants", label: "Restaurants" },
  { id: "how-it-works", to: "/#how-it-works", label: "How CampusEats works", targetId: "how-it-works" },
  { id: "community", to: "/#community", label: "Join our community", targetId: "community" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const location = useLocation();

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

  useEffect(() => {
    if (location.pathname !== "/") {
      return;
    }

    if (location.hash === "#how-it-works") {
      setActiveSection("how-it-works");
    } else if (location.hash === "#community" || location.hash === "#partnerships") {
      setActiveSection("community");
    } else if (!location.hash && window.scrollY < 200) {
      setActiveSection("home");
    }

    function checkActiveSection() {
      const scrollPos = window.scrollY + 160;
      const howItWorks = document.getElementById("how-it-works");
      const community = document.getElementById("community") || document.getElementById("partnerships");

      if (community && scrollPos >= community.offsetTop) {
        setActiveSection("community");
      } else if (howItWorks && scrollPos >= howItWorks.offsetTop) {
        setActiveSection("how-it-works");
      } else {
        setActiveSection("home");
      }
    }

    checkActiveSection();
    window.addEventListener("scroll", checkActiveSection, { passive: true });
    return () => window.removeEventListener("scroll", checkActiveSection);
  }, [location.pathname, location.hash]);

  function handleNavClick(e, link) {
    if (menuOpen) setMenuOpen(false);

    if (link.targetId) {
      if (location.pathname === "/") {
        e.preventDefault();
        const el = document.getElementById(link.targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", `/#${link.targetId}`);
          setActiveSection(link.targetId);
        }
      }
    } else if (link.id === "home") {
      if (location.pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.pushState(null, "", "/");
        setActiveSection("home");
      }
    }
  }

  function isLinkActive(link) {
    if (location.pathname === "/") {
      if (link.targetId) {
        return activeSection === link.targetId;
      }
      return link.id === "home" && activeSection === "home";
    }
    return location.pathname === link.to;
  }

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="container navbar__inner">
        <Link
          to="/"
          className="navbar__brand"
          onClick={(e) => {
            if (menuOpen) setMenuOpen(false);
            if (location.pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
              window.history.pushState(null, "", "/");
              setActiveSection("home");
            }
          }}
        >
          <Logo />
        </Link>

        <nav className="navbar__links" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.id}
              to={link.to}
              onClick={(e) => handleNavClick(e, link)}
              className={`navbar__link ${isLinkActive(link) ? "is-active" : ""}`}
            >
              {link.label}
            </Link>
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
            <Link
              key={link.id}
              to={link.to}
              onClick={(e) => handleNavClick(e, link)}
              className={`navbar__mobile-link ${isLinkActive(link) ? "is-active" : ""}`}
            >
              {link.label}
            </Link>
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
