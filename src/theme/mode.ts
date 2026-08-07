export const THEME_STORAGE_KEY = "michaelos:theme-mode:v1";

export type ThemeMode = "light" | "dark";

export const DEFAULT_THEME_MODE: ThemeMode = "dark";

export function parseThemeMode(value: unknown): ThemeMode | null {
  return value === "light" || value === "dark" ? value : null;
}

export function nextThemeMode(mode: ThemeMode): ThemeMode {
  return mode === "dark" ? "light" : "dark";
}
