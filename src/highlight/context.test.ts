import { describe, expect, it } from "vitest";
import { matchesHighlightView } from "./lenses";

describe("Highlight relevant lenses", () => {
  it("matches relevant structured content without hiding all-content view", () => {
    expect(
      matchesHighlightView("platform", ["A Kubernetes developer platform"]),
    ).toBe(true);
    expect(matchesHighlightView("ai", ["Registered agent capabilities"])).toBe(
      true,
    );
    expect(matchesHighlightView("all", ["Anything"])).toBe(true);
  });

  it("does not mark unrelated evidence as relevant", () => {
    expect(
      matchesHighlightView("procurement", ["Local-first research notes"]),
    ).toBe(false);
  });
});
