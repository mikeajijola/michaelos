import { describe, expect, it } from "vitest";
import { DEFAULT_THEME_MODE, nextThemeMode, parseThemeMode } from "./mode";

describe("colour mode", () => {
  it("defaults new visits to dark mode", () => {
    expect(DEFAULT_THEME_MODE).toBe("dark");
  });
  it("accepts only supported persisted values", () => {
    expect(parseThemeMode("light")).toBe("light");
    expect(parseThemeMode("dark")).toBe("dark");
    expect(parseThemeMode("sepia")).toBeNull();
    expect(parseThemeMode(null)).toBeNull();
  });

  it("returns the opposite mode for the header control", () => {
    expect(nextThemeMode("light")).toBe("dark");
    expect(nextThemeMode("dark")).toBe("light");
  });
});
