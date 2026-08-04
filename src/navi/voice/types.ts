import type { CapabilityTraceEntry } from "@/lily/types";

export type NaviVoiceState =
  | "inactive"
  | "requesting-permission"
  | "connecting"
  | "listening"
  | "interpreting"
  | "executing"
  | "speaking"
  | "interrupted"
  | "error";

export type NaviVoiceRequestResult = {
  text: string;
  trace: CapabilityTraceEntry[];
  failed: boolean;
};

export type NaviRealtimeCallbacks = {
  onState: (state: NaviVoiceState) => void;
  onTranscript: (text: string, final: boolean) => void;
  onInputLevel: (level: number) => void;
  onCapabilityResult: (result: NaviVoiceRequestResult) => void;
  onError: (message: string, technical?: unknown) => void;
  handleRequest: (request: string) => Promise<NaviVoiceRequestResult>;
};

export interface NaviRealtimeAdapter {
  readonly provider: "vercel-ai-gateway" | "google-gemini-live";
  readonly model: string;
  start(callbacks: NaviRealtimeCallbacks): Promise<void>;
  setMuted(muted: boolean): void;
  interrupt(): void;
  stop(reason?: "user" | "panel-close" | "timeout" | "inactivity"): void;
}

export const NAVI_VOICE_MAX_SESSION_MS = 180_000;
export const NAVI_VOICE_INACTIVITY_MS = 45_000;

export function naviVoiceEnabled(
  env: {
    NEXT_PUBLIC_NAVI_VOICE_ENABLED?: string;
    NEXT_PUBLIC_NAVI_VOICE_KILL_SWITCH?: string;
  } = {
    NEXT_PUBLIC_NAVI_VOICE_ENABLED:
      process.env.NEXT_PUBLIC_NAVI_VOICE_ENABLED,
    NEXT_PUBLIC_NAVI_VOICE_KILL_SWITCH:
      process.env.NEXT_PUBLIC_NAVI_VOICE_KILL_SWITCH,
  },
) {
  return (
    env.NEXT_PUBLIC_NAVI_VOICE_ENABLED !== "false" &&
    env.NEXT_PUBLIC_NAVI_VOICE_KILL_SWITCH !== "true"
  );
}

export function voiceStatusText(state: NaviVoiceState, muted = false) {
  if (muted) return "Microphone muted";
  const labels: Record<NaviVoiceState, string> = {
    inactive: "Voice mode off",
    "requesting-permission": "Waiting for microphone permission…",
    connecting: "Connecting voice mode…",
    listening: "Microphone active · Listening",
    interpreting: "Understanding your request…",
    executing: "Running a MikeOS capability…",
    speaking: "Navi is speaking",
    interrupted: "Navi was interrupted",
    error: "Voice mode needs attention",
  };
  return labels[state];
}

export function friendlyVoiceError(error: unknown) {
  if (error instanceof DOMException && error.name === "NotAllowedError")
    return "Microphone access was denied. You can continue in text mode or allow access and try again.";
  if (error instanceof DOMException && error.name === "NotFoundError")
    return "No microphone was found. You can continue in text mode.";
  return "Voice mode could not start. Please try again or continue in text mode.";
}
