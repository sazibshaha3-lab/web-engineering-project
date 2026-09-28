import { useState } from "react";
import { LocateFixed, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import "./CurrentLocationButton.css";

export default function CurrentLocationButton({ onDetected, onUseSavedInstead }) {
  const [state, setState] = useState("idle"); // idle | detecting | success | error
  const [attempt, setAttempt] = useState(0);

  function handleDetect() {
    setState("detecting");
    setTimeout(() => {
      const nextAttempt = attempt + 1;
      setAttempt(nextAttempt);
      if (nextAttempt === 1) {
        setState("error");
      } else {
        setState("success");
        onDetected?.({
          label: "Other",
          line: "Current location (near Campus Gate)",
          area: "Detected area",
          city: "Campus Town",
          details: "Detected via device location",
        });
      }
    }, 1000);
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
            <span>We couldn't detect your current location.</span>
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
      <button type="button" className="current-location__trigger" onClick={handleDetect} disabled={state === "detecting"}>
        <span className={`current-location__icon ${state === "detecting" ? "is-spinning" : ""}`}>
          {state === "detecting" ? <Loader2 size={17} strokeWidth={2} /> : <LocateFixed size={17} strokeWidth={2} />}
        </span>
        {state === "detecting" ? "Detecting your location..." : "Use current location"}
      </button>
    </div>
  );
}
