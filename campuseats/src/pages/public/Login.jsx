import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, User, Store, Bike, ShieldCheck } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthHeader from "../../components/auth/AuthHeader";
import PasswordInput from "../../components/auth/PasswordInput";
import Input from "../../components/forms/Input";
import Button from "../../components/common/Button";
import InlineMessage from "../../components/common/InlineMessage";
import { useAuth } from "../../context/AuthContext";
import { isValidEmailOrPhone } from "../../utils/validators";
import "./Auth.css";

const DEMO_ACCOUNTS = [
  { role: "customer", label: "Customer", email: "demo@campuseats.test", password: "Demo123!", icon: User },
  { role: "restaurant", label: "Restaurant", email: "restaurant@campuseats.test", password: "Restaurant123!", icon: Store },
  { role: "rider", label: "Rider", email: "rider@campuseats.test", password: "Rider123!", icon: Bike },
  { role: "admin", label: "Admin", email: "admin@campuseats.test", password: "Admin123!", icon: ShieldCheck },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginMock } = useAuth();
  const redirectTo = location.state?.from;
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success
  const [quickRole, setQuickRole] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
    setFormError("");
  }

  function validate() {
    const next = {};
    if (!form.email.trim()) next.email = "Enter your email or phone number.";
    else if (!isValidEmailOrPhone(form.email)) next.email = "Enter a valid email or phone number.";
    if (!form.password) next.password = "Enter your password.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function performLogin(email, password) {
    setStatus("loading");
    setFormError("");

    setTimeout(() => {
      const result = loginMock(email, password);
      if (result.success) {
        setStatus("success");
        setTimeout(() => {
          if (result.role === "restaurant") navigate("/restaurant");
          else if (result.role === "rider") navigate("/rider");
          else if (result.role === "admin") navigate("/admin");
          else navigate(redirectTo && redirectTo.startsWith("/customer") ? redirectTo : "/customer");
        }, 500);
      } else {
        setStatus("idle");
        setQuickRole(null);
        setFormError(result.message);
      }
    }, 900);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (status === "loading") return;
    if (!validate()) return;
    performLogin(form.email, form.password);
  }

  function handleQuickLogin(account) {
    if (status === "loading") return;
    setErrors({});
    setFormError("");
    setForm({ email: account.email, password: account.password });
    setQuickRole(account.role);
    // Let the audience see the credentials populate before submitting.
    setTimeout(() => performLogin(account.email, account.password), 350);
  }

  return (
    <AuthLayout variant="login">
      <AuthHeader title="Welcome back" subtitle="Log in to keep ordering from your favourite spots." />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <InlineMessage tone="error">{formError}</InlineMessage>

        <Input
          label="Email or phone number"
          type="text"
          placeholder="you@campus.edu"
          icon={Mail}
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
          autoComplete="username"
        />
        <PasswordInput
          label="Password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="auth-form__row">
          <label className="auth-form__checkbox">
            <input type="checkbox" /> Remember me
          </label>
          <Link to="/login">Forgot password?</Link>
        </div>

        <Button type="submit" fullWidth size="lg" loading={status === "loading" && !quickRole}>
          {status === "loading" && !quickRole ? "Signing in..." : status === "success" && !quickRole ? "Welcome back!" : "Log in"}
        </Button>
      </form>

      <div className="demo-accounts">
        <div className="demo-accounts__divider">
          <span>or explore a demo account</span>
        </div>
        <div className="demo-accounts__grid">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.role}
              type="button"
              className="demo-accounts__item"
              disabled={status === "loading"}
              onClick={() => handleQuickLogin(account)}
            >
              <span className="demo-accounts__icon">
                {status === "loading" && quickRole === account.role ? (
                  <span className="demo-accounts__spinner" />
                ) : (
                  <account.icon size={18} strokeWidth={2} />
                )}
              </span>
              <span className="demo-accounts__text">
                <strong>{account.label}</strong>
                <span>{account.email}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="auth-form__footer">
        New to CampusEats? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
