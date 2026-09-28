import { Link } from "react-router-dom";
import Logo from "../common/Logo";
import "./AuthHeader.css";

export default function AuthHeader({ title, subtitle }) {
  return (
    <div className="auth-header">
      <Link to="/" className="auth-header__logo">
        <Logo />
      </Link>
      <h1 className="auth-header__title">{title}</h1>
      {subtitle && <p className="auth-header__subtitle">{subtitle}</p>}
    </div>
  );
}
