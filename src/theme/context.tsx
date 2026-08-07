"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_THEME_MODE,
  parseThemeMode,
  THEME_STORAGE_KEY,
  type ThemeMode,
} from "./mode";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_THEME_MODE);

  const setMode = useCallback((next: ThemeMode) => {
    applyTheme(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    setModeState(next);
  }, []);

  useEffect(() => {
    const stored = parseThemeMode(localStorage.getItem(THEME_STORAGE_KEY));
    const initial = stored ?? DEFAULT_THEME_MODE;
    setMode(initial);

    const handleThemeControl = (event: Event) => {
      const requested = parseThemeMode(
        (event as CustomEvent<{ mode?: unknown }>).detail?.mode,
      );
      if (requested) setMode(requested);
    };
    window.addEventListener("theme-control", handleThemeControl);
    return () => window.removeEventListener("theme-control", handleThemeControl);
  }, [setMode]);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider.");
  return value;
}
