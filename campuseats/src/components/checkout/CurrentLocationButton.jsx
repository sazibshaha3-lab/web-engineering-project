import { useState } from "react";
import { LocateFixed, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import "./CurrentLocationButton.css";

export default function CurrentLocationButton({ onDetected, onUseSavedInstead }) {
  const [state, setState] = useState("idle"); // idle | detecting | success | error
  const [errorMessage, setErrorMessage] = useState("");

  function handleDetect() {
    if (!navigator.geolocation) {
      setErrorMessage("This browser doesn't support device location. Please choose a saved address or enter one manually.");
      setState("error");
      return;
    }

    setState("detecting");
    setErrorMessage("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const latitude = Number(coords.latitude.toFixed(6));
        const longitude = Number(coords.longitude.toFixed(6));
        const accuracy = Math.max(1, Math.round(coords.accuracy));
        setState("saving");
        let result;
        try {
          result = await onDetected?.({
            label: "Current location",
            line: "My current GPS location",
            area: "",
            city: "",
            details: `GPS accuracy about ${accuracy} m`,
            latitude,
            longitude,
          });
        } catch {
          setErrorMessage("We found your location but couldn't save it. Please try again.");
          setState("error");
          return;
        }
        if (result?.success === false) {
          setErrorMessage(result.message || "We found your location but couldn't save it. Please try again.");
          setState("error");
          return;
        }
        setState("success");
      },
      (error) => {
        const messages = {
          1: "Location permission was denied. Allow location access in your browser settings, or enter your address manually.",
          2: "Your device couldn't determine its location. Try again or enter your address manually.",
          3: "Location request timed out. Try again or enter your address manually.",
        };
        setErrorMessage(messages[error.code] || "Couldn't get your location. Please try again or enter your address manually.");
        setState("error");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  }

  if (state === "success") {
    return (
      <div className="current-location">
        <div className="current-location__success">
          <CheckCircle2 size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span>Current location detected. We've added it as a delivery option below.</span>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="current-location">
        <div className="current-location__error">
          <AlertTriangle size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
          <div>
            <span>{errorMessage}</span>
            <div className="current-location__error-actions">
              <button type="button" onClick={handleDetect}>Try again</button>
              <button type="button" onClick={onUseSavedInstead}>Choose a saved address</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="current-location">
      <button type="button" className="current-location__trigger" onClick={handleDetect} disabled={state === "detecting" || state === "saving"}>
        <span className={`current-location__icon ${state === "detecting" || state === "saving" ? "is-spinning" : ""}`}>
          {state === "detecting" || state === "saving" ? <Loader2 size={17} strokeWidth={2} /> : <LocateFixed size={17} strokeWidth={2} />}
        </span>
        {state === "detecting" ? "Detecting your location..." : state === "saving" ? "Saving your location..." : "Use current location"}
      </button>
    </div>
  );
}
