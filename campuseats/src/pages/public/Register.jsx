import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthHeader from "../../components/auth/AuthHeader";
import PasswordInput from "../../components/auth/PasswordInput";
import PasswordStrength from "../../components/auth/PasswordStrength";
import Input from "../../components/forms/Input";
import Button from "../../components/common/Button";
import InlineMessage from "../../components/common/InlineMessage";
import { useAuth } from "../../context/AuthContext";
import { isValidEmail, isValidPhone, isValidPasswordFormat } from "../../utils/validators";
import "./Auth.css";

const initialForm = { name: "", email: "", phone: "", password: "", confirm: "", terms: false };

export default function Register() {
  const navigate = useNavigate();
  const { startRegistration } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState("idle");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
    setFormError("");
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Enter your full name.";
    if (!form.email.trim()) next.email = "Enter your email address.";
    else if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (!form.phone.trim()) next.phone = "Enter your phone number.";
    else if (!isValidPhone(form.phone)) next.phone = "Enter a valid phone number.";
    if (!form.password) next.password = "Create a password.";
    else if (!isValidPasswordFormat(form.password))
      next.password = "Use at least 8 characters, with a letter and a number.";
    if (!form.confirm) next.confirm = "Confirm your password.";
    else if (form.confirm !== form.password) next.confirm = "Passwords don't match.";
    if (!form.terms) next.terms = "You must accept the Terms to continue.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (status === "loading") return;
    if (!validate()) return;

    setStatus("loading");
    setTimeout(() => {
      startRegistration({ name: form.name.trim(), email: form.email, phone: form.phone });
      navigate("/verify-otp");
    }, 900);
  }

  return (
    <AuthLayout variant="register">
      <AuthHeader title="Create your account" subtitle="Join CampusEats to order from restaurants and hostel messes near you." />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <InlineMessage tone="error">{formError}</InlineMessage>

        <Input
          label="Full name"
          placeholder="Your name"
          icon={User}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          error={errors.name}
          autoComplete="name"
        />
        <Input
          label="Email address"
          type="email"
          placeholder="you@campus.edu"
          icon={Mail}
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <Input
          label="Phone number"
          type="tel"
          placeholder="+880 1XXXXXXXXX"
          icon={Phone}
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          error={errors.phone}
          autoComplete="tel"
        />
        <PasswordInput
          label="Password"
          placeholder="Create a password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          error={errors.password}
          autoComplete="new-password"
        />
        <PasswordStrength password={form.password} />
        <PasswordInput
          label="Confirm password"
          placeholder="Re-enter your password"
          value={form.confirm}
          onChange={(e) => update("confirm", e.target.value)}
          error={errors.confirm}
          autoComplete="new-password"
        />

        <label className="auth-form__terms">
          <input
            type="checkbox"
            checked={form.terms}
            onChange={(e) => update("terms", e.target.checked)}
          />
          <span>
            I agree to the <Link to="/">Terms of Service</Link> and <Link to="/">Privacy Policy</Link>.
          </span>
        </label>
        {errors.terms && <InlineMessage tone="error">{errors.terms}</InlineMessage>}

        <Button type="submit" fullWidth size="lg" loading={status === "loading"}>
          {status === "loading" ? "Creating your account..." : "Create account"}
        </Button>
      </form>

      <p className="auth-form__footer">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
