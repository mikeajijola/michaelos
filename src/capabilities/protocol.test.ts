import { describe, expect, it } from "vitest";
import { capabilities } from "./registry";
import { advanceGateway, AGENT_GATEWAY_CODES, parseProtocol, resolveCli, resolveTemplate } from "./protocol";

describe("capability registry", () => {
  it("has unique, complete definitions", () => { expect(new Set(capabilities.map(item => item.id)).size).toBe(capabilities.length); expect(capabilities.length).toBeGreaterThanOrEqual(42); for (const item of capabilities) { expect(item.cli.command).toBeTruthy(); expect(item.keyboard.template.at(-1)).toBe("ENTER"); expect(item.accessibility.label).toBeTruthy(); expect(item.examples.length).toBeGreaterThan(0); } });
  it("resolves CLI and protocol from the same definition", () => { const item = capabilities.find(entry => entry.id === "project.view")!; expect(resolveCli(item, { slug: "atlas-platform" })).toBe("run project.view --slug atlas-platform"); expect(resolveTemplate(item.keyboard.template, { slug: "atlas-platform" })).toBe("PROJECT VIEW atlas-platform ENTER"); expect(parseProtocol("PROJECT VIEW atlas-platform ENTER", capabilities)).toMatchObject({ capability: { id: "project.view" }, params: { slug: "atlas-platform" } }); });
});

describe("agent gateway", () => {
  const chord = (code: string, repeat = false) => ({ code, repeat, ctrlKey: true, altKey: true, shiftKey: true });
  it("activates only after the exact six chords", () => { let progress = { step: 0, lastAt: 0 }; let activated = false; AGENT_GATEWAY_CODES.forEach((code, index) => { const result = advanceGateway(progress, chord(code), 1000 + index * 100); progress = result.progress; activated = result.activated; expect(result.consume).toBe(true); if (index < 5) expect(activated).toBe(false); }); expect(activated).toBe(true); });
  it("resets on a wrong or timed-out step and ignores repeats", () => { let result = advanceGateway({ step: 0, lastAt: 0 }, chord("F9"), 1000); result = advanceGateway(result.progress, chord("F10", true), 1100); expect(result.progress.step).toBe(1); result = advanceGateway(result.progress, chord("F12"), 1200); expect(result.progress.step).toBe(0); result = advanceGateway({ step: 1, lastAt: 1000 }, chord("F10"), 5001); expect(result.activated).toBe(false); expect(result.progress.step).toBe(0); });
});
