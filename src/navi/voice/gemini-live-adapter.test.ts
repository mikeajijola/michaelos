import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({
  callbacks: undefined as
    | {
        onmessage: (message: unknown) => void;
        onclose?: () => void;
      }
    | undefined,
  session: {
    sendRealtimeInput: vi.fn(),
    sendToolResponse: vi.fn(),
    close: vi.fn(),
  },
}));

vi.mock("@google/genai", () => ({
  Modality: { AUDIO: "AUDIO" },
  GoogleGenAI: class {
    live = {
      connect: vi.fn(async (parameters) => {
        harness.callbacks = parameters.callbacks;
        return harness.session;
      }),
    };
  },
}));

import { GeminiLiveNaviAdapter } from "./gemini-live-adapter";
import type { NaviRealtimeCallbacks } from "./types";

class FakeAudioContext {
  sampleRate = 16_000;
  currentTime = 0;
  destination = {};
  createMediaStreamSource() {
    return { connect: vi.fn(), disconnect: vi.fn() };
  }
  createScriptProcessor() {
    return { connect: vi.fn(), disconnect: vi.fn(), onaudioprocess: null };
  }
  createGain() {
    return {
      gain: { value: 1 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
  close() {
    return Promise.resolve();
  }
}

function mediaStream() {
  const track = { enabled: true, stop: vi.fn() };
  return {
    track,
    stream: {
      getTracks: () => [track],
      getAudioTracks: () => [track],
    } as unknown as MediaStream,
  };
}

function callbacks(overrides: Partial<NaviRealtimeCallbacks> = {}) {
  return {
    onState: vi.fn(),
    onTranscript: vi.fn(),
    onInputLevel: vi.fn(),
    onCapabilityResult: vi.fn(),
    onError: vi.fn(),
    handleRequest: vi.fn(async () => ({
      text: "I opened Mike’s CV.",
      trace: [],
      failed: false,
    })),
    ...overrides,
  } satisfies NaviRealtimeCallbacks;
}

describe("Gemini Live Navi adapter", () => {
  beforeEach(() => {
    harness.callbacks = undefined;
    for (const fn of Object.values(harness.session)) fn.mockClear();
    Object.defineProperty(globalThis, "window", {
      value: globalThis,
      configurable: true,
    });
    Object.defineProperty(globalThis, "AudioContext", {
      value: FakeAudioContext,
      configurable: true,
    });
    Object.defineProperty(globalThis, "fetch", {
      value: vi.fn(async () =>
        Response.json({
          token: "ephemeral-token",
          model: "gemini-live-test",
          expiresAt: new Date(Date.now() + 180_000).toISOString(),
        }),
      ),
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reports denied microphone permission with recovery copy", async () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {
        mediaDevices: {
          getUserMedia: vi.fn(async () => {
            throw new DOMException("denied detail", "NotAllowedError");
          }),
        },
      },
      configurable: true,
    });
    const events = callbacks();
    await new GeminiLiveNaviAdapter().start(events);
    expect(events.onState).toHaveBeenCalledWith("requesting-permission");
    expect(events.onState).toHaveBeenLastCalledWith("error");
    expect(events.onError).toHaveBeenCalledWith(
      expect.stringContaining("Microphone access was denied"),
      expect.anything(),
    );
  });

  it("connects, displays the opening copy, listens, mutes and closes media", async () => {
    const media = mediaStream();
    Object.defineProperty(globalThis, "navigator", {
      value: {
        mediaDevices: { getUserMedia: vi.fn(async () => media.stream) },
      },
      configurable: true,
    });
    const events = callbacks();
    const adapter = new GeminiLiveNaviAdapter();
    await adapter.start(events);
    expect(events.onState).toHaveBeenCalledWith("connecting");
    expect(events.onTranscript).toHaveBeenCalledWith(
      "What do you need?",
      true,
    );
    expect(events.onState).toHaveBeenLastCalledWith("listening");
    adapter.setMuted(true);
    expect(media.track.enabled).toBe(false);
    adapter.setMuted(false);
    expect(media.track.enabled).toBe(true);
    adapter.stop("panel-close");
    expect(media.track.stop).toHaveBeenCalled();
    expect(harness.session.close).toHaveBeenCalled();
    expect(events.onState).toHaveBeenLastCalledWith("inactive");
  });

  it("submits a live request to the browser boundary and returns its result", async () => {
    const media = mediaStream();
    Object.defineProperty(globalThis, "navigator", {
      value: {
        mediaDevices: { getUserMedia: vi.fn(async () => media.stream) },
      },
      configurable: true,
    });
    const events = callbacks();
    const adapter = new GeminiLiveNaviAdapter();
    await adapter.start(events);
    harness.callbacks?.onmessage({
      toolCall: {
        functionCalls: [
          {
            id: "call-1",
            name: "submit_navigation_request",
            args: { request: "Open my CV" },
          },
        ],
      },
    });
    await vi.waitFor(() =>
      expect(events.handleRequest).toHaveBeenCalledWith("Open my CV"),
    );
    expect(events.onState).toHaveBeenCalledWith("executing");
    expect(events.onCapabilityResult).toHaveBeenCalledWith(
      expect.objectContaining({ text: "I opened Mike’s CV." }),
    );
    expect(harness.session.sendToolResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        functionResponses: expect.objectContaining({ id: "call-1" }),
      }),
    );
    adapter.interrupt();
    expect(events.onState).toHaveBeenCalledWith("interrupted");
    adapter.stop();
  });
});
