import type { NaviVoiceState } from "./types";

export type NaviFaceState =
  | "idle"
  | "listening"
  | "speaking"
  | "executing"
  | "error";

export function naviFaceState(state: NaviVoiceState): NaviFaceState {
  if (state === "listening" || state === "interrupted") return "listening";
  if (state === "speaking") return "speaking";
  if (state === "interpreting" || state === "executing") return "executing";
  if (state === "error") return "error";
  return "idle";
}
