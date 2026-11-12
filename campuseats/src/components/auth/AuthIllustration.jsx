import { Sparkles, Bike, Star } from "lucide-react";
import "./AuthIllustration.css";

const content = {
  login: {
    heading: "Good food is worth the wait — but not too long.",
    sub: "Log back in to pick up right where your last order left off.",
    badge: "Campus cravings, sorted",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80&auto=format&fit=crop",
    imageAlt: "Delicious food feast for campus orders",
    stat: "4.8 ★ average rating from 2,300+ campus orders",
    floatingText: "Fast Campus Delivery",
    floatingSub: "Hot & fresh to your hall or lab",
  },
  register: {
    heading: "Campus kitchens, hostel messes, and everything between.",
    sub: "Create an account once and order from anywhere near you.",
    badge: "Join thousands of students",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&q=80&auto=format&fit=crop",
    imageAlt: "Campus favourite burgers and meals",
    stat: "Over 40+ nearby restaurants & messes",
    floatingText: "Join CampusEats",
    floatingSub: "Student discounts & swift service",
  },
  "verify-otp": {
    heading: "One quick check before we let you in.",
    sub: "This keeps your CampusEats account secure.",
    badge: "Account security",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80&auto=format&fit=crop",
    imageAlt: "Warm and cozy restaurant dining",
    stat: "Safe, encrypted & fast authentication",
    floatingText: "Quick Verification",
    floatingSub: "Instant OTP delivery to email",
  },
};

export default function AuthIllustration({ variant = "login" }) {
  const copy = content[variant] || content.login;

  return (
    <div className="auth-illustration">
      <div className="auth-illustration__bg">
        <img
          src={copy.image}
          alt={copy.imageAlt}
          className="auth-illustration__image"
          loading="eager"
        />
        <div className="auth-illustration__overlay" />
      </div>

      <div className="auth-illustration__floating-card">
        <div className="auth-illustration__floating-icon">
          <Bike size={18} strokeWidth={2.2} />
        </div>
        <div className="auth-illustration__floating-text">
          <strong>{copy.floatingText}</strong>
          <span>{copy.floatingSub}</span>
        </div>
      </div>

      <div className="auth-illustration__content">
        <div className="auth-illustration__badge">
          <Sparkles size={14} className="auth-illustration__badge-icon" />
          <span>{copy.badge}</span>
        </div>

        <h2 className="auth-illustration__heading">{copy.heading}</h2>
        <p className="auth-illustration__sub">{copy.sub}</p>

        <div className="auth-illustration__stat">
          <Star size={14} fill="#f59e0b" color="#f59e0b" />
          <span>{copy.stat}</span>
        </div>
      </div>
    </div>
  );
}
