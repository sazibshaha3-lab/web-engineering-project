import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import Logo from "../common/Logo";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Link to="/" aria-label="CampusEats home"><Logo /></Link>
          <p>
            Food from campus restaurants and hostel messes, ordered in a couple of taps and
            delivered by riders who know the campus.
          </p>
        </div>

        <div className="footer__col">
          <h4>Company</h4>
          <Link to="/about">About CampusEats</Link>
          <Link to="/careers">Careers</Link>
          <a href="/#partnerships">Partner with us</a>
          <Link to="/register" state={{ role: "rider" }}>Become a rider</Link>
        </div>

        <div className="footer__col">
          <h4>Quick links</h4>
          <Link to="/customer/restaurants">Browse restaurants</Link>
          <Link to="/login">Log in</Link>
          <Link to="/register">Create customer account</Link>
          <Link to="/customer/orders">Track an order</Link>
        </div>

        <div className="footer__col">
          <h4>Support</h4>
          <a href="mailto:support@campuseats.app"><Mail size={15} /> support@campuseats.app</a>
          <Link to="/help">Help centre</Link>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>© {new Date().getFullYear()} CampusEats. All rights reserved.</p>
        <div className="footer__legal">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
