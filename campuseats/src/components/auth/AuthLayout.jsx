import { Link } from "react-router-dom";
import Logo from "../common/Logo";
import AuthIllustration from "./AuthIllustration";
import "./AuthLayout.css";

export default function AuthLayout({ variant = "login", children }) {
  return (
    <div className="auth-split">
      <div className="auth-split__illustration">
        <AuthIllustration variant={variant} />
      </div>
      <div className="auth-split__form">
        <Link to="/" className="auth-split__mobile-logo">
          <Logo />
        </Link>
        <div className="auth-split__form-inner fade-in">{children}</div>
      </div>
    </div>
  );
}
