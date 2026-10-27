import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "campuseats_theme";

export const THEMES = [
  { id: "orange", label: "Mango orange", color: "#f2622e" },
  { id: "blue", label: "Ocean blue", color: "#3178c6" },
  { id: "purple", label: "Berry purple", color: "#8551bf" },
  { id: "green", label: "Fresh green", color: "#2f8f62" },
];

const ThemeContext = createContext(null);

function getSavedTheme() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return THEMES.some(({ id }) => id === saved) ? saved : "orange";
  } catch {
    return "orange";
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getSavedTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // The selected theme still applies for this session if storage is unavailable.
    }
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme, themes: THEMES }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
