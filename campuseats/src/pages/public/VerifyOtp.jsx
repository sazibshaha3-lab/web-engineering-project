import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthHeader from "../../components/auth/AuthHeader";
import OtpInput from "../../components/auth/OtpInput";
import Button from "../../components/common/Button";
import InlineMessage from "../../components/common/InlineMessage";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";
import "./VerifyOtp.css";

const RESEND_SECONDS = 60;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { pendingSignup, verifyOtpMock } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | verifying | success
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [resendMessage, setResendMessage] = useState("");
  const intervalRef = useRef(null);

  const contact = pendingSignup?.maskedEmail || pendingSignup?.maskedPhone || "your registered email";
  const expired = seconds === 0;

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  function handleChange(value) {
    setCode(value);
    if (error) setError("");
  }

  function handleVerify(e) {
    e.preventDefault();
    if (code.length !== 6 || status === "verifying") return;

    if (expired) {
      setError("This code has expired. Request a new one.");
      setCode("");
      return;
    }

    setStatus("verifying");
    setError("");

    setTimeout(() => {
      const result = verifyOtpMock(code);
      if (result.success) {
        setStatus("success");
        setTimeout(() => navigate("/customer"), 900);
      } else {
        setStatus("idle");
        setError(result.message);
        setCode("");
      }
    }, 700);
  }

  function handleResend() {
    if (seconds > 0) return;
    clearInterval(intervalRef.current);
    setSeconds(RESEND_SECONDS);
    intervalRef.current = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    setResendMessage("A new verification code has been sent.");
    setTimeout(() => setResendMessage(""), 3500);
  }

  if (!pendingSignup && status !== "success") {
    return <Navigate to="/register" replace />;
  }

  return (
    <AuthLayout variant="verify-otp">
      {status === "success" ? (
        <div className="otp-success fade-in">
          <span className="otp-success__badge">
            <CheckCircle2 size={30} strokeWidth={1.8} />
          </span>
          <h2>You're verified!</h2>
          <p>Taking you to CampusEats...</p>
        </div>
      ) : (
        <>
          <AuthHeader
            title="Verify your account"
            subtitle={`Enter the 6-digit code we sent to ${contact}.`}
          />

          <form className="auth-form" onSubmit={handleVerify} noValidate>
            <InlineMessage tone="error">{error}</InlineMessage>
            <InlineMessage tone="success">{resendMessage}</InlineMessage>
            {expired && !error && <InlineMessage tone="error">This code has expired. Tap resend to get a new one.</InlineMessage>}

            <OtpInput length={6} value={code} onChange={handleChange} error={!!error || expired} />

            <Button type="submit" fullWidth size="lg" disabled={code.length !== 6} loading={status === "verifying"}>
              {status === "verifying" ? "Verifying..." : "Verify & continue"}
            </Button>

            <div className="verify-otp__resend">
              {seconds > 0 ? (
                <span>Resend code in {String(seconds).padStart(2, "0")}s</span>
              ) : (
                <button type="button" onClick={handleResend}>
                  Resend OTP
                </button>
              )}
            </div>

            <p className="auth-form__hint">
              Demo code: <strong>123456</strong>
            </p>

            <Link to="/register" className="verify-otp__change">
              Change contact method
            </Link>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
