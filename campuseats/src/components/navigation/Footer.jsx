import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone } from "lucide-react";
import Logo from "../common/Logo";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo />
          <p>
            Food from campus restaurants and hostel messes, ordered in a couple of taps and
            delivered by riders who know the campus.
          </p>
          <div className="footer__social">
            <a href="#" aria-label="Facebook"><Facebook size={17} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={17} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={17} /></a>
          </div>
        </div>

        <div className="footer__col">
          <h4>Company</h4>
          <Link to="/">About CampusEats</Link>
          <Link to="/">Careers</Link>
          <Link to="/">Partner with us</Link>
          <Link to="/">Become a rider</Link>
        </div>

        <div className="footer__col">
          <h4>Quick links</h4>
          <Link to="/customer/restaurants">Browse restaurants</Link>
          <Link to="/login">Log in</Link>
          <Link to="/register">Create account</Link>
          <Link to="/customer/orders">Track an order</Link>
        </div>

        <div className="footer__col">
          <h4>Support</h4>
          <a href="mailto:support@campuseats.app"><Mail size={15} /> support@campuseats.app</a>
          <a href="tel:+8801000000000"><Phone size={15} /> +880 1000-000000</a>
          <Link to="/">Help centre</Link>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>© {new Date().getFullYear()} CampusEats. All rights reserved.</p>
        <div className="footer__legal">
          <Link to="/">Terms</Link>
          <Link to="/">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
