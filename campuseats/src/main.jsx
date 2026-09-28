import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { validateMockData } from "./utils/dataValidation";
import { restaurants as seedRestaurants } from "./data/restaurants";
import { foods as seedFoods } from "./data/foods";

// Dev-only sanity check on the raw mock dataset (never runs in production
// builds, never shown to end users — see validateMockData's own doc comment).
if (import.meta.env.DEV) {
  validateMockData(seedRestaurants, seedFoods);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
