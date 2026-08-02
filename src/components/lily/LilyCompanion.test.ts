import { describe, expect, it } from "vitest";
import { clampBubblePosition, didDrag } from "@/lily/bubble-position";
describe("Lily Bubble positioning", () => {
  it("clamps persisted ratios to safe viewport bounds", () => { expect(clampBubblePosition({ edge: "left", yRatio: -4 })).toEqual({ edge: "left", yRatio: .12 }); expect(clampBubblePosition({ edge: "right", yRatio: 9 })).toEqual({ edge: "right", yRatio: .86 }); });
  it("distinguishes a click from the six-pixel drag threshold", () => { expect(didDrag(3, 4)).toBe(false); expect(didDrag(6, 0)).toBe(true); });
});
