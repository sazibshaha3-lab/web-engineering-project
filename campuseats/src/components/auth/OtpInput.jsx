import { useRef, useState, useEffect } from "react";
import "./OtpInput.css";

export default function OtpInput({ length = 6, value, onChange, error, success }) {
  const [digits, setDigits] = useState(() => value?.split("") || Array(length).fill(""));
  const inputsRef = useRef([]);

  useEffect(() => {
    if (value === "") setDigits(Array(length).fill(""));
  }, [value, length]);

  function commit(next) {
    setDigits(next);
    onChange?.(next.join(""));
  }

  function handleChange(i, raw) {
    const char = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = char;
    commit(next);
    if (char && i < length - 1) {
      inputsRef.current[i + 1]?.focus();
    }
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const next = [...digits];
        next[i] = "";
        commit(next);
      } else if (i > 0) {
        inputsRef.current[i - 1]?.focus();
        const next = [...digits];
        next[i - 1] = "";
        commit(next);
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      inputsRef.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      inputsRef.current[i + 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    const next = Array(length).fill("");
    pasted.split("").forEach((d, i) => (next[i] = d));
    commit(next);
    const focusIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  }

  return (
    <div className={`otp-input ${error ? "otp-input--error" : ""} ${success ? "otp-input--success" : ""}`}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          value={d}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit ${i + 1} of ${length}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
