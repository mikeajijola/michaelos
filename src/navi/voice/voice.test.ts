import { describe, expect, it } from "vitest";
import {
  friendlyVoiceError,
  naviVoiceEnabled,
  NAVI_VOICE_INACTIVITY_MS,
  NAVI_VOICE_MAX_SESSION_MS,
  voiceStatusText,
  type NaviVoiceState,
} from "./types";
import {
  DEFAULT_NAVI_REALTIME_MODEL,
  NAVI_REALTIME_TOOL,
} from "./config";

describe("Navi Voice Mode contract", () => {
  it("defines textual status for every explicit voice state", () => {
    const states: NaviVoiceState[] = [
      "inactive",
      "requesting-permission",
      "connecting",
      "listening",
      "interpreting",
      "executing",
      "speaking",
      "interrupted",
      "error",
    ];
    for (const state of states) expect(voiceStatusText(state)).toBeTruthy();
    expect(voiceStatusText("listening")).toContain("Microphone active");
    expect(voiceStatusText("listening", true)).toBe("Microphone muted");
  });

  it("uses human recovery copy for denied microphone permission", () => {
    const message = friendlyVoiceError(
      new DOMException("provider detail", "NotAllowedError"),
    );
    expect(message).toContain("Microphone access was denied");
    expect(message).not.toContain("provider detail");
  });

  it("uses human recovery copy for connection failures", () => {
    const message = friendlyVoiceError(new Error("channel disconnected"));
    expect(message).toContain("Voice mode could not start");
    expect(message).not.toContain("channel disconnected");
  });

  it("supports a browser feature flag and kill switch", () => {
    expect(naviVoiceEnabled({})).toBe(true);
    expect(
      naviVoiceEnabled({ NEXT_PUBLIC_NAVI_VOICE_ENABLED: "false" }),
    ).toBe(false);
    expect(
      naviVoiceEnabled({ NEXT_PUBLIC_NAVI_VOICE_KILL_SWITCH: "true" }),
    ).toBe(false);
  });

  it("enforces the public session and inactivity bounds", () => {
    expect(NAVI_VOICE_MAX_SESSION_MS).toBe(180_000);
    expect(NAVI_VOICE_INACTIVITY_MS).toBeLessThan(NAVI_VOICE_MAX_SESSION_MS);
  });

  it("exposes one bounded request tool rather than browser capabilities", () => {
    expect(NAVI_REALTIME_TOOL.name).toBe("submit_navigation_request");
    expect(NAVI_REALTIME_TOOL.parametersJsonSchema.required).toEqual([
      "request",
    ]);
    expect(JSON.stringify(NAVI_REALTIME_TOOL)).not.toMatch(
      /sqlite|dom|navigateBrowser|executeCode/i,
    );
  });

  it("uses a configurable Gemini Live default", () => {
    expect(DEFAULT_NAVI_REALTIME_MODEL).toMatch(/gemini.*live/i);
  });
});
