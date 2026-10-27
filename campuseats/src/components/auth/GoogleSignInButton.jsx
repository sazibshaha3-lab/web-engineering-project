import { useEffect, useRef, useState } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleSignInButton({ onCredential, disabled = false }) {
  const buttonRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const [error, setError] = useState("");

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setError("Google sign-in needs a Web OAuth client ID in VITE_GOOGLE_CLIENT_ID.");
      return undefined;
    }

    let cancelled = false;
    const renderGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (!response?.credential) {
            setError("Google did not return a sign-in credential. Please try again.");
            return;
          }
          setError("");
          Promise.resolve(callbackRef.current?.(response.credential)).catch(() => {
            setError("Google sign-in failed. Please try again.");
          });
        },
        auto_select: false,
      });

      buttonRef.current.replaceChildren();
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: Math.min(400, Math.floor(buttonRef.current.getBoundingClientRect().width || 400)),
        logo_alignment: "left",
      });
    };

    let script = document.querySelector('script[data-google-identity="true"]');
    const onLoad = () => renderGoogleButton();
    const onError = () => setError("Google sign-in could not load. Check your connection and try again.");

    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else {
      if (!script) {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.dataset.googleIdentity = "true";
        document.head.appendChild(script);
      }
      script.addEventListener("load", onLoad);
      script.addEventListener("error", onError);
    }

    return () => {
      cancelled = true;
      script?.removeEventListener("load", onLoad);
      script?.removeEventListener("error", onError);
    };
  }, []);

  return (
    <div className="google-signin">
      <div
        ref={buttonRef}
        className={`google-signin__button ${!GOOGLE_CLIENT_ID ? "is-empty" : ""} ${disabled ? "is-disabled" : ""}`}
        aria-disabled={disabled}
      />
      {!GOOGLE_CLIENT_ID && (
        <button className="google-signin__fallback" type="button" disabled>
          <span aria-hidden="true">G</span> Continue with Google
        </button>
      )}
      {error && <p className="google-signin__message" role="status">{error}</p>}
    </div>
  );
}
