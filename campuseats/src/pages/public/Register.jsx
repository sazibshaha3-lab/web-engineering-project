import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Mail, Phone, ShoppingBag, Store, Bike, ShieldCheck, MapPin } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthHeader from "../../components/auth/AuthHeader";
import PasswordInput from "../../components/auth/PasswordInput";
import PasswordStrength from "../../components/auth/PasswordStrength";
import Input from "../../components/forms/Input";
import Button from "../../components/common/Button";
import InlineMessage from "../../components/common/InlineMessage";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import { useAuth } from "../../context/AuthContext";
import { isValidEmail, isValidPhone, isValidPasswordFormat } from "../../utils/validators";
import "./Auth.css";

const accountTypes = [
  { value: "customer", label: "Customer", description: "Order food", icon: ShoppingBag },
  { value: "restaurant_owner", label: "Restaurant", description: "Manage a kitchen", icon: Store },
  { value: "rider", label: "Rider", description: "Deliver orders", icon: Bike },
  { value: "admin", label: "Admin", description: "Platform access", icon: ShieldCheck },
];

const initialForm = {
  role: "customer", name: "", email: "", phone: "", password: "", confirm: "", terms: false,
  restaurantName: "", restaurantAddress: "", vehicleType: "", vehicleNumber: "", adminInviteCode: "",
};

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from;
  const { startRegistration, loginWithGoogle } = useAuth();
  const requestedRole = accountTypes.some((type) => type.value === location.state?.role)
    ? location.state.role
    : initialForm.role;
  const [form, setForm] = useState(() => ({ ...initialForm, role: requestedRole }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState("idle");
  const [emailTouched, setEmailTouched] = useState(false);
  const selectedType = accountTypes.find((type) => type.value === form.role) || accountTypes[0];

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({
      ...current,
      [field]: field === "email" && emailTouched && value.trim() && !isValidEmail(value)
        ? "Enter a valid email address, for example name@gmail.com."
        : "",
    }));
    setFormError("");
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Enter your full name.";
    if (!form.email.trim()) next.email = "Enter your email address.";
    else if (!isValidEmail(form.email)) next.email = "Enter a valid email address, for example name@gmail.com.";
    if (!form.phone.trim()) next.phone = "Enter your phone number.";
    else if (!isValidPhone(form.phone)) next.phone = "Enter a valid phone number.";
    if (!form.password) next.password = "Create a password.";
    else if (!isValidPasswordFormat(form.password)) next.password = "Use at least 8 characters, with a letter and a number.";
    if (!form.confirm) next.confirm = "Confirm your password.";
    else if (form.confirm !== form.password) next.confirm = "Passwords don't match.";
    if (form.role === "restaurant_owner") {
      if (!form.restaurantName.trim()) next.restaurantName = "Enter your restaurant name.";
      if (!form.restaurantAddress.trim()) next.restaurantAddress = "Enter your restaurant address.";
    }
    if (form.role === "rider") {
      if (!form.vehicleType.trim()) next.vehicleType = "Enter your vehicle type.";
      if (!form.vehicleNumber.trim()) next.vehicleNumber = "Enter your vehicle number.";
    }
    if (form.role === "admin" && !form.adminInviteCode.trim()) next.adminInviteCode = "Enter your admin invitation code.";
    if (!form.terms) next.terms = "You must accept the Terms to continue.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (status === "loading" || !validate()) return;

    setStatus("loading");
    const result = await startRegistration({
        name: form.name.trim(),
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
        restaurantName: form.restaurantName.trim(),
        restaurantAddress: form.restaurantAddress.trim(),
        vehicleType: form.vehicleType.trim(),
        vehicleNumber: form.vehicleNumber.trim(),
        adminInviteCode: form.adminInviteCode,
    });
    if (!result.success) {
      setStatus("idle");
      setFormError(result.message);
      return;
    }
    navigate("/verify-otp", { state: { from: redirectTo } });
  }

  async function handleGoogleCredential(credential) {
    if (status === "loading") return;
    setStatus("loading");
    setFormError("");
    const result = await loginWithGoogle(credential);
    if (!result.success) {
      setStatus("idle");
      setFormError(result.message);
      return;
    }

    if (result.role === "restaurant") navigate("/restaurant");
    else if (result.role === "rider") navigate("/rider");
    else if (result.role === "admin") navigate("/admin");
    else navigate(redirectTo && redirectTo.startsWith("/customer") ? redirectTo : "/customer");
  }

  return (
    <AuthLayout variant="register">
      <AuthHeader
        title={`Create ${selectedType.label.toLowerCase()} account`}
        subtitle={form.role === "admin"
          ? "Admin access requires an invitation from the platform owner."
          : "Choose your account type, then enter the details needed for that role."}
      />

      <div className="register-role-grid" role="group" aria-label="Choose account type">
        {accountTypes.map(({ value, label, description, icon: Icon }) => (
          <button
            key={value}
            type="button"
            className={`register-role-option ${form.role === value ? "is-selected" : ""}`}
            aria-pressed={form.role === value}
            disabled={status === "loading"}
            onClick={() => update("role", value)}
          >
            <Icon size={18} strokeWidth={2} />
            <span><strong>{label}</strong><small>{description}</small></span>
          </button>
        ))}
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <InlineMessage tone="error">{formError}</InlineMessage>

        {form.role === "admin" && (
          <InlineMessage tone="info">Admin signup is protected. Ask the platform owner for an invitation code.</InlineMessage>
        )}

        <Input label="Full name" placeholder="Your name" icon={User} value={form.name} onChange={(event) => update("name", event.target.value)} error={errors.name} autoComplete="name" />
        <Input label="Email address" type="email" placeholder="you@campus.edu" icon={Mail} value={form.email} onChange={(event) => update("email", event.target.value)} onBlur={() => {
          setEmailTouched(true);
          setErrors((current) => ({
            ...current,
            email: form.email.trim() && !isValidEmail(form.email)
              ? "Enter a valid email address, for example name@gmail.com."
              : current.email?.startsWith("Enter a valid email address") ? "" : current.email,
          }));
        }} error={errors.email} autoComplete="email" aria-invalid={!!errors.email} />
        <Input label="Phone number" type="tel" placeholder="+880 1XXXXXXXXX" icon={Phone} value={form.phone} onChange={(event) => update("phone", event.target.value)} error={errors.phone} autoComplete="tel" />

        {form.role === "restaurant_owner" && (
          <>
            <Input label="Restaurant name" placeholder="Your restaurant or mess name" icon={Store} value={form.restaurantName} onChange={(event) => update("restaurantName", event.target.value)} error={errors.restaurantName} />
            <Input label="Restaurant address" placeholder="Street, area, campus" icon={MapPin} value={form.restaurantAddress} onChange={(event) => update("restaurantAddress", event.target.value)} error={errors.restaurantAddress} />
          </>
        )}

        {form.role === "rider" && (
          <>
            <Input label="Vehicle type" placeholder="Bike, bicycle, scooter..." icon={Bike} value={form.vehicleType} onChange={(event) => update("vehicleType", event.target.value)} error={errors.vehicleType} />
            <Input label="Vehicle number" placeholder="Registration number" value={form.vehicleNumber} onChange={(event) => update("vehicleNumber", event.target.value)} error={errors.vehicleNumber} />
          </>
        )}

        {form.role === "admin" && (
          <Input label="Admin invitation code" type="password" placeholder="Invitation code" icon={ShieldCheck} value={form.adminInviteCode} onChange={(event) => update("adminInviteCode", event.target.value)} error={errors.adminInviteCode} autoComplete="one-time-code" />
        )}

        <PasswordInput label="Password" placeholder="Create a password" value={form.password} onChange={(event) => update("password", event.target.value)} error={errors.password} autoComplete="new-password" />
        <PasswordStrength password={form.password} />
        <PasswordInput label="Confirm password" placeholder="Re-enter your password" value={form.confirm} onChange={(event) => update("confirm", event.target.value)} error={errors.confirm} autoComplete="new-password" />

        <label className="auth-form__terms">
          <input type="checkbox" checked={form.terms} onChange={(event) => update("terms", event.target.checked)} />
          <span>I agree to the <Link to="/">Terms of Service</Link> and <Link to="/">Privacy Policy</Link>.</span>
        </label>
        {errors.terms && <InlineMessage tone="error">{errors.terms}</InlineMessage>}

        <Button type="submit" fullWidth size="lg" loading={status === "loading"}>
          {status === "loading" ? "Creating your account..." : `Create ${selectedType.label.toLowerCase()} account`}
        </Button>
      </form>

      {form.role === "customer" && (
        <>
          <div className="auth-social-divider"><span>or create with</span></div>
          <GoogleSignInButton onCredential={handleGoogleCredential} disabled={status === "loading"} />
          <p className="google-signin__hint">Google sign-up creates a customer account.</p>
        </>
      )}

      <p className="auth-form__footer">
        Already have an account? <Link to="/login" state={{ from: redirectTo }}>Log in</Link>
      </p>
    </AuthLayout>
  );
}
