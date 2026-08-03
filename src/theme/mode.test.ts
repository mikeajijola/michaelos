import { describe, expect, it } from "vitest";
import { nextThemeMode, parseThemeMode } from "./mode";

describe("colour mode", () => {
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
