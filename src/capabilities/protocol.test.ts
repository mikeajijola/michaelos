import { describe, expect, it } from "vitest";
import { capabilities } from "./registry";
import { normaliseExecutionHistory } from "./executor";
import {
  auditCapabilities,
  generateCapabilityManifest,
  getCapabilityDelta,
} from "./governance";
import {
  advanceGateway,
  AGENT_GATEWAY_CODES,
  isActionKeyModeShortcut,
  parseProtocol,
  resolveCli,
  resolveTemplate,
} from "./protocol";

describe("capability registry", () => {
  it("has unique, complete definitions", () => {
    expect(new Set(capabilities.map((item) => item.id)).size).toBe(
      capabilities.length,
    );
    expect(capabilities.length).toBeGreaterThanOrEqual(42);
    for (const item of capabilities) {
      expect(item.cli.command).toBeTruthy();
      expect(item.keyboard.template.at(-1)).toBe("ENTER");
      expect(item.accessibility.label).toBeTruthy();
      expect(item.examples.length).toBeGreaterThan(0);
    }
  });
  it("resolves CLI and protocol from the same definition", () => {
    const item = capabilities.find((entry) => entry.id === "project.view")!;
    expect(resolveCli(item, { slug: "nexus-backstage" })).toBe(
      "run project.view --slug nexus-backstage",
    );
    expect(
      resolveTemplate(item.keyboard.template, { slug: "nexus-backstage" }),
    ).toBe("PROJECT VIEW nexus-backstage ENTER");
    expect(
      parseProtocol("PROJECT VIEW nexus-backstage ENTER", capabilities),
    ).toMatchObject({
      capability: { id: "project.view" },
      params: { slug: "nexus-backstage" },
    });
  });
  it("exposes colour mode through canonical CLI and Action Keys", () => {
    const item = capabilities.find((entry) => entry.id === "theme.setMode")!;
    expect(item.navigator.enabled).toBe(true);
    expect(resolveCli(item, { mode: "dark" })).toBe(
      "run theme.setMode --mode dark",
    );
    expect(resolveTemplate(item.keyboard.template, { mode: "dark" })).toBe(
      "THEME SET dark ENTER",
    );
    expect(parseProtocol("THEME SET dark ENTER", capabilities)).toMatchObject({
      capability: { id: "theme.setMode" },
      params: { mode: "dark" },
    });
  });
  it("exposes Navi under the renamed canonical capability namespace", () => {
    const item = capabilities.find((entry) => entry.id === "navi.open")!;
    expect(resolveCli(item, {})).toBe("run navi.open");
    expect(resolveTemplate(item.keyboard.template, {})).toBe(
      "NAVI OPEN ENTER",
    );
    expect(parseProtocol("NAVI OPEN ENTER", capabilities)).toMatchObject({
      capability: { id: "navi.open" },
      params: {},
    });
    expect(capabilities.some((entry) => entry.id === "lily.open")).toBe(false);
    const voice = capabilities.find(
      (entry) => entry.id === "navi.startVoice",
    )!;
    expect(resolveCli(voice, {})).toBe("run navi.startVoice");
    expect(resolveTemplate(voice.keyboard.template, {})).toBe(
      "NAVI VOICE START ENTER",
    );
  });
});

describe("agent gateway", () => {
  const chord = (code: string, repeat = false) => ({
    code,
    repeat,
    ctrlKey: true,
    altKey: true,
    shiftKey: true,
  });
  it("activates only after the exact six chords", () => {
    let progress = { step: 0, lastAt: 0 };
    let activated = false;
    AGENT_GATEWAY_CODES.forEach((code, index) => {
      const result = advanceGateway(progress, chord(code), 1000 + index * 100);
      progress = result.progress;
      activated = result.activated;
      expect(result.consume).toBe(true);
      if (index < 5) expect(activated).toBe(false);
    });
    expect(activated).toBe(true);
  });
  it("resets on a wrong or timed-out step and ignores repeats", () => {
    let result = advanceGateway({ step: 0, lastAt: 0 }, chord("F9"), 1000);
    result = advanceGateway(result.progress, chord("F10", true), 1100);
    expect(result.progress.step).toBe(1);
    result = advanceGateway(result.progress, chord("F12"), 1200);
    expect(result.progress.step).toBe(0);
    result = advanceGateway({ step: 1, lastAt: 1000 }, chord("F10"), 5001);
    expect(result.activated).toBe(false);
    expect(result.progress.step).toBe(0);
  });
});

describe("Action Key Mode", () => {
  const shortcut = (
    overrides: Partial<Parameters<typeof isActionKeyModeShortcut>[0]> = {},
  ) => ({
    code: "KeyK",
    ctrlKey: true,
    metaKey: false,
    altKey: true,
    shiftKey: false,
    ...overrides,
  });

  it("recognises the Windows/Linux and macOS accelerators", () => {
    expect(isActionKeyModeShortcut(shortcut())).toBe(true);
    expect(
      isActionKeyModeShortcut(shortcut({ ctrlKey: false, metaKey: true })),
    ).toBe(true);
    expect(isActionKeyModeShortcut(shortcut({ altKey: false }))).toBe(false);
    expect(isActionKeyModeShortcut(shortcut({ shiftKey: true }))).toBe(false);
  });

  it("accepts an unquoted multi-word Action Key parameter", () => {
    expect(
      parseProtocol("PROJECT SEARCH platform engineering", capabilities),
    ).toMatchObject({
      capability: { id: "project.search" },
      params: { query: "platform engineering" },
    });
  });

  it("accepts a complete Action Key with its canonical ENTER token", () => {
    expect(parseProtocol("THEME SET light ENTER", capabilities)).toMatchObject(
      {
        capability: { id: "theme.setMode" },
        params: { mode: "light" },
      },
    );
  });

  it("accepts the same Action Key when the user omits the ENTER token", () => {
    expect(parseProtocol("THEME SET dark", capabilities)).toMatchObject({
      capability: { id: "theme.setMode" },
      params: { mode: "dark" },
    });
  });

  it("rejects commands that are not registry Action Keys", () => {
    expect(parseProtocol("DELETE EVERYTHING", capabilities)).toBeNull();
  });
});

describe("Action Key history compatibility", () => {
  it("aliases legacy resolvedProtocol values without crashing", () => {
    const [event] = normaliseExecutionHistory([
      {
        capabilityId: "project.view",
        resolvedProtocol: "PROJECT VIEW nexus-backstage ENTER",
      },
    ]);
    expect(event.resolvedActionKeys).toBe("PROJECT VIEW nexus-backstage ENTER");
    expect(event.resolvedProtocol).toBe("PROJECT VIEW nexus-backstage ENTER");
  });

  it("keeps a current Action Key value when both fields exist", () => {
    const [event] = normaliseExecutionHistory([
      { resolvedActionKeys: "CURRENT", resolvedProtocol: "LEGACY" },
    ]);
    expect(event.resolvedActionKeys).toBe("CURRENT");
  });
});

describe("capability governance", () => {
  it("audits the live registry and generates its manifest", () => {
    const audit = auditCapabilities(capabilities);
    expect(audit).toMatchObject({
      status: "pass",
      summary: { registered: capabilities.length, errors: 0, warnings: 0 },
      issues: [],
    });
    expect(generateCapabilityManifest(capabilities)).toHaveLength(
      capabilities.length,
    );
  });

  it("detects duplicate Action Keys and unknown UI mappings", () => {
    const duplicate = { ...capabilities[1], id: "test.duplicate" };
    const audit = auditCapabilities(
      [...capabilities, duplicate],
      ["missing.uiCapability"],
    );
    expect(audit.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "DUPLICATE_ACTION_KEYS",
        "UNKNOWN_UI_CAPABILITY",
      ]),
    );
  });

  it("classifies required parameters, removals, and risk escalation as breaking", () => {
    const [entry] = generateCapabilityManifest(capabilities);
    const changed = {
      ...entry,
      risk: "write" as const,
      parameters: [
        {
          name: "required",
          description: "Required value.",
          type: "string" as const,
          required: true,
        },
      ],
    };
    const delta = getCapabilityDelta(
      [changed],
      [entry, generateCapabilityManifest(capabilities)[1]],
    );
    expect(delta.breaking.map((change) => change.id)).toEqual(
      expect.arrayContaining([entry.id, capabilities[1].id]),
    );
    expect(delta.changed[0].breakingReasons).toEqual(
      expect.arrayContaining([
        "Required parameter required added.",
        `Risk increased from ${entry.risk} to write.`,
      ]),
    );
  });
});
